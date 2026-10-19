import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {clinic} from '../src/clinic.mjs';
const script=readFileSync('src/client.js','utf8');
function page(route='') {
  const dom=new JSDOM(readFileSync(`dist/${route?route+'/':''}index.html`,'utf8'),{url:'https://elite-care-hospital.pages.dev/'+route,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom;
  window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new window.Event('close'));};
  window.eval(script);
  const $=selector=>window.document.querySelector(selector);
  const change=(selector,value)=>{const el=$(selector);if(el.type==='checkbox'||el.type==='radio')el.checked=value;else el.value=value;el.dispatchEvent(new window.Event(el.type==='search'?'input':'change',{bubbles:true}));return el;};
  const submit=selector=>$(selector).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  return {dom,window,$,change,submit};
}
test('all four routes have local assets, semantic navigation and correct metadata',()=>{
  for(const route of ['','doctor/dr-faizan-aziz','lab-tests','gallery']){
    const {dom,$,window}=page(route);
    assert.equal(window.document.querySelectorAll('h1').length,1);
    assert.equal($('link[rel="canonical"]').href,'https://elite-care-hospital.pages.dev/'+route);
    const schema=JSON.parse($('script[type="application/ld+json"]').textContent)['@graph'];
    assert.equal(schema.find(n=>n['@type']==='MedicalClinic').telephone,clinic.phone);
    assert.equal(schema.find(n=>n['@type']==='MedicalClinic').hasMap,clinic.mapsUrl);
    assert.equal(schema.find(n=>n['@type']==='MedicalClinic').openingHoursSpecification[0].opens,'19:00');
    for(const el of window.document.querySelectorAll('img[src^="/"],script[src^="/"],link[href^="/assets/"]')){
      const asset=el.getAttribute('src')||el.getAttribute('href');assert.ok(existsSync('dist'+asset),asset);
    }
    for(const link of window.document.querySelectorAll('a[href^="#"]')) assert.ok(window.document.getElementById(link.getAttribute('href').slice(1)),link.outerHTML);
    assert.doesNotMatch(window.document.body.textContent,/PROCARE|PRO-LAB-|PDF Delivered|Verified by Pathologist|100% Accurate|Booking Confirmed/);
    if(!route){assert.equal($('.brand img').getAttribute('src'),'/images/logo-clean.png');assert.equal($('.doctor-portrait').getAttribute('src'),'/images/dr-faizan-enhanced.webp');
      assert.equal(window.document.querySelectorAll('#doctors').length,1);
      assert.match($('#doctors').textContent,/Education & Fellowship/);
      assert.match($('#doctors').textContent,/7 years/);
      assert.match($('#doctors').textContent,/Hindi, English, Telugu/);
      assert.match($('#doctors').textContent,/Elite Health Care, Opposite Pillar No\. 97/);
      assert.equal($('.doctor-source').href,clinic.doctorProfile.source);
      assert.equal(window.document.querySelectorAll('#doctor-media-home .profile-media-card').length,6);
      assert.equal(window.document.querySelectorAll('#doctor-media-home .talk-card .play-button').length,3);
      assert.ok(window.document.querySelector('#doctor-media-home .talk-card[href*="youtube.com/watch"]'));
      assert.equal(window.document.querySelectorAll('#procedures .home-procedure-category').length,4);
      assert.equal(window.document.querySelectorAll('#procedures .home-procedure-card').length,25);
      assert.equal(window.document.querySelectorAll('#procedures .procedure-card-image').length,25);
      assert.equal(window.document.querySelectorAll('#procedures .home-procedure-category-head img').length,4);
      assert.match($('#procedures').textContent,/Diagnostic Procedures/);
      assert.match($('#procedures').textContent,/Therapeutic Procedures/);
      assert.match($('#procedures').textContent,/Pediatric Pulmonology/);
      assert.match($('#procedures').textContent,/Advanced Pulmonary Care/);
      assert.equal($('#reviews [data-count="10000"]').dataset.suffix,'+');
      assert.equal($('#reviews .google-review-card a').href,clinic.mapsUrl);
      assert.equal(schema.find(n=>n['@type']==='Person').sameAs,clinic.doctorProfile.source);
      assert.doesNotMatch(window.document.body.textContent,/68106529/);
for(const id of ['home','doctors','services','lab-tests','pharmacy','faq','contact','timings','location','appointment'])assert.ok($('#'+id));}
    assert.equal($('#location .map-link').href,clinic.mapsUrl);
    assert.equal($('#location .location-address-link').href,clinic.mapsUrl);
    assert.match($('#timings').textContent,/7:00 PM - 10:00 PM/);
    assert.equal($('.floating-call span').textContent,'Call');
    assert.equal($('.floating-book span').textContent,'Book appointment');
    assert.match($('.footer-contact address').textContent,/Pillar No\. 97, Mughal Nagar/);
    assert.equal($('.footer-directions').href,clinic.mapsUrl);
    dom.window.close();
  }
  assert.ok(readFileSync('dist/robots.txt','utf8').includes('/sitemap.xml'));
  const sitemap=readFileSync('dist/sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,4);
  assert.ok(statSync('src/client.js').size<15000);
});
test('full doctor profile provides structured, carefully qualified information',()=>{
  const {$,window,dom}=page('doctor/dr-faizan-aziz');
  assert.match($('h1').textContent,/Dr\. Faizan Aziz/);
  assert.equal($('.profile-sources'),null);
  assert.match($('.profile-location address').textContent,/Pillar No\. 97, Mughal Nagar/);
  assert.equal($('.profile-location>.button').href,clinic.mapsUrl);
  for(const id of ['about-doctor','qualifications','expertise','procedures','experience','recognition','doctor-faq']) assert.ok($('#'+id));
  assert.equal(window.document.querySelectorAll('.procedure-group').length,4);
  assert.ok(window.document.querySelectorAll('.procedure-group li').length>=25);
  assert.equal(window.document.querySelectorAll('.procedure-group img').length,4);
  assert.equal(window.document.querySelectorAll('.profile-media-card').length,6);
  assert.equal(window.document.querySelectorAll('.profile-media-card img').length,6);
  assert.equal(window.document.querySelectorAll('.talk-card .play-button').length,3);
  assert.ok(window.document.querySelector('.talk-card[href*="youtube.com/watch"]'));
  assert.match(window.document.querySelector('.talk-card[href*="youtube.com/watch"] img').src,/img\.youtube\.com\/vi\/eGKtYMoaVZs/);
  assert.equal(window.document.querySelectorAll('[role="tab"]').length,3);
  $('#memberships-tab').click();assert.equal($('#memberships-panel').hidden,false);assert.equal($('#awards-panel').hidden,true);
  assert.doesNotMatch(window.document.body.textContent,/Client verification required/);
  assert.doesNotMatch(window.document.body.textContent,/guaranteed|best doctor in Hyderabad/i);
  dom.window.close();
});
test('gallery shows sourced doctor photography instead of placeholders',()=>{
  const {window,dom}=page('gallery');
  assert.equal(window.document.querySelectorAll('.gallery-card').length,4);
  assert.equal(window.document.querySelectorAll('.gallery-card img[alt]').length,4);
  assert.equal(window.document.querySelectorAll('.gallery-card figcaption>a[target="_blank"]').length,2);
  assert.equal(window.document.querySelectorAll('#doctor-media-gallery .profile-media-card').length,6);
  assert.equal(window.document.querySelectorAll('#doctor-media-gallery .talk-card .play-button').length,3);
  assert.match(window.document.body.textContent,/Dr\. Faizan Aziz/);
  assert.match(window.document.body.textContent,/Project OJAS/);
  assert.doesNotMatch(window.document.body.textContent,/coming soon/i);
  dom.window.close();
});
test('mobile menu and appointment validation/review/edit/reset',()=>{
  const {$,change,submit,dom,window}=page();
  $('.menu-toggle').click();assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'true');$('#main-nav a[href="#doctors"]').click();assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'false');
  assert.equal($('.menu-toggle').getAttribute('aria-label'),'Open navigation');
  $('.menu-toggle').click();
  window.document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'false');
  assert.equal(window.document.activeElement,$('.menu-toggle'));
  $('[data-open="appointment"]').click();assert.ok($('#enquiry-dialog').open);
  change('#enquiry-form input[name="name"]',' Test <Patient> ');change('#enquiry-form input[name="phone"]','123');submit('#enquiry-form');assert.equal($('#enquiry-review').hidden,true);assert.match($('#enquiry-form .form-error').textContent,/valid/);
  change('#enquiry-form input[name="phone"]','+91 90000 00000');submit('#enquiry-form');assert.equal($('#enquiry-review').hidden,false);
  const link=new URL($('#enquiry-send').href);assert.equal(link.pathname,'/919966447044');assert.match(link.searchParams.get('text'),/Dr. Faizan Aziz/);assert.match(link.searchParams.get('text'),/Test <Patient>/);assert.equal($('#enquiry-review patient'),null);
  $('.edit-request').click();assert.equal($('#enquiry-form').hidden,false);assert.equal($('#enquiry-form input[name="name"]').value,' Test <Patient> ');
  $('.close-dialog').click();$('[data-open="appointment"]').click();assert.equal($('#enquiry-form input[name="phone"]').value,'');assert.equal($('#enquiry-review').hidden,true);
  dom.window.close();
});
test('pharmacy, reports, day care and checkups all create honest requests',()=>{
  const {$,change,submit,dom}=page();
  for(const type of ['pharmacy','report','daycare','checkup']){
    $(`[data-open="${type}"]`).click();change('#enquiry-form input[name="name"]','Test Patient');change('#enquiry-form input[name="phone"]','9000000000');
    if(type==='report')change('#enquiry-form input[name="sample"]','SAMPLE-42');else change('#enquiry-form textarea[name="note"]','Question to reception');
    submit('#enquiry-form');assert.equal($('#enquiry-review').hidden,false);
    const text=new URL($('#enquiry-send').href).searchParams.get('text');assert.match(text,/9000000000/);assert.match(text,/Please (check|confirm)/);assert.doesNotMatch(text,/booking ref|ready and verified|confirmed booking/i);
    if(type==='report')assert.match(text,/SAMPLE-42/);else assert.match(text,/Question to reception/);
    $('.close-dialog').click();
  }
  dom.window.close();
});
test('test deselection, filtered removal, clear all and home collection validation',()=>{
  const {$,change,submit,dom}=page('lab-tests');
  assert.equal($('#review-tests').disabled,true);change('#test-0',true);change('#test-1',true);assert.equal($('#selected-count').textContent,'2 selected');
  change('#test-0',false);assert.equal($('#selected-count').textContent,'1 selected');change('#test-search','thyroid');assert.equal($('#test-1').closest('label').hidden,true);$('#selected-list button').click();assert.equal($('#selected-count').textContent,'0 selected');
  change('#test-search','');change('#test-0',true);change('#test-1',true);$('#clear-tests').click();assert.equal($('#selected-count').textContent,'0 selected');change('#test-7',true);
  change('#lab-form input[name="name"]','Test Patient');change('#lab-form input[name="phone"]','9000000000');change('#lab-form input[value="Home Collection"]',true);assert.equal($('#address-field').hidden,false);
  submit('#lab-form');assert.match($('#lab-form .form-error').textContent,/address/);assert.equal($('#lab-review').hidden,true);
  change('#lab-form textarea[name="address"]','Test address');submit('#lab-form');assert.equal($('#lab-review').hidden,false);
  const request=new URL($('#lab-send').href).searchParams.get('text');assert.match(request,/Post Lunch Blood Sugar/);assert.match(request,/Test address/);assert.match(request,/confirm test availability, prices/);assert.doesNotMatch(request,/PROCARE|PRO-LAB|Booking Confirmed/);
  $('#edit-lab').click();assert.equal($('#lab-form').hidden,false);assert.equal($('#lab-form input[name="name"]').value,'Test Patient');change('#test-7',false);assert.equal($('#review-tests').disabled,true);
  dom.window.close();
});
