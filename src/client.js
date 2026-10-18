(() => {
  'use strict';
  const config = JSON.parse(document.getElementById('clinic-config').textContent);
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const whatsapp = text => `https://wa.me/${config.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  const validPhone = phone => /^(?:91)?[6-9]\d{9}$/.test(phone.replace(/[\s()+-]/g, ''));
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  $$('input[type="date"]').forEach(input => { input.min = minDate; });
  function showDetails(container, rows) {
    container.replaceChildren();
    rows.forEach(([label,value]) => {
      if (!value) return;
      const row = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = value; row.append(dt,dd); container.append(row);
    });
  }
  function getFields(form) {
    const data = new FormData(form);
    return Object.fromEntries([...data.entries()].map(([key,value]) => [key,String(value).trim()]));
  }
  function validate(form, fields, requireName = true) {
    const error = $('.form-error', form);
    if (requireName && !fields.name) { error.textContent = 'Please enter the patient name.'; return false; }
    if (!validPhone(fields.phone || '')) { error.textContent = 'Enter a valid 10-digit Indian mobile number (with optional +91).'; return false; }
    if (fields.date && fields.date < minDate) { error.textContent = 'Choose today or a future date.'; return false; }
    error.textContent = ''; return true;
  }
  const toggle = $('.menu-toggle'), navigation = $('#main-nav');
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation'); navigation.classList.toggle('is-open',open);
  });
  const closeNavigation = () => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  };
  $$('a',navigation).forEach(link => link.addEventListener('click', closeNavigation));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeNavigation();
      toggle.focus();
    }
  });
  const dialog = $('#enquiry-dialog'), form = $('#enquiry-form'), review = $('#enquiry-review');
  const types = {
    appointment: ['Appointment Request', 'Reception will confirm the doctor\'s availability and timing on WhatsApp.', 'an appointment with '+config.doctor],
    pharmacy: ['Pharmacy Enquiry', 'Enter medicine names and quantities. Attach your prescription in WhatsApp. Reception confirms stock, pricing and delivery.', 'medicines from your pharmacy'],
    report: ['Request Your Lab Report', 'Reception will check availability and verify your details before sharing a report.', 'the status of my lab report'],
    daycare: ['Day Care Enquiry', 'Ask reception about available day care services, timings and charges.', 'day care services'],
    checkup: ['Health Checkup Enquiry', 'Reception will confirm the available health checkup options, preparation and prices.', 'a preventive health checkup'],
  };
  let currentType = 'appointment', lastTrigger = null;
  function openEnquiry(type, trigger) {
    currentType = types[type] ? type : 'appointment'; lastTrigger = trigger;
    const [title,intro] = types[currentType];
    form.reset();form.hidden = false;review.hidden = true;$('.form-error',form).textContent='';
    $('#enquiry-title').textContent = title;$('#enquiry-intro').textContent=intro;
    const report = currentType === 'report';
    $('input[name="name"]',form).closest('label').hidden=report;$('input[name="name"]',form).required=!report;
    $('input[name="date"]',form).closest('label').hidden=report||currentType==='pharmacy';
    $('#time-field').hidden=report||currentType==='pharmacy';$('#sample-field').hidden=!report;$('#note-field').hidden=report;
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open','');
  }
  $$('[data-open]').forEach(button => button.addEventListener('click',()=>openEnquiry(button.dataset.open,button)));
  function closeDialog(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');lastTrigger?.focus();}
  $('.close-dialog',dialog).addEventListener('click',closeDialog);
  dialog.addEventListener('click',event => {if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog();}});
  dialog.addEventListener('close',()=>{form.reset();$('#enquiry-send').removeAttribute('href');lastTrigger?.focus();});
  form.addEventListener('submit',event=>{
    event.preventDefault();const fields=getFields(form), report=currentType==='report';
    if(!validate(form,fields,!report))return;
    const rows=report?[['Registered mobile',fields.phone],['Sample ID / bill number',fields.sample]]:[['Patient',fields.name],['Mobile',fields.phone],['Preferred date',fields.date],['Preferred time',fields.time],['Notes',fields.note]];
    const request=`Hello ${config.name},\nI would like to enquire about ${types[currentType][2]}.\n\n${rows.filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join('\n')}\n\n${report?'Please check whether my report is available and confirm any verification needed.':'Please confirm availability, timing, preparation instructions and any charges.'}`;
    showDetails($('.review-details',review),rows);$('#enquiry-send').href=whatsapp(request);form.hidden=true;review.hidden=false;review.setAttribute('tabindex','-1');review.focus();
  });
  $('.edit-request',review).addEventListener('click',()=>{review.hidden=true;form.hidden=false;});
  const profileTabs = $$('[role="tab"]');
  profileTabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>{
      profileTabs.forEach(item=>{item.setAttribute('aria-selected','false');item.tabIndex=-1;const panel=$('#'+item.getAttribute('aria-controls'));if(panel)panel.hidden=true;});
      tab.setAttribute('aria-selected','true');tab.tabIndex=0;const panel=$('#'+tab.getAttribute('aria-controls'));if(panel)panel.hidden=false;
    });
    tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+profileTabs.length)%profileTabs.length;profileTabs[next].focus();profileTabs[next].click();});
  });
  const motionReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const revealItems = $$([
    '.service-card','.doctor-profile-grid>article','.why-card','.steps li','.promo',
    '.faq-grid details','.profile-section','.profile-media-card','.gallery-card',
    '.gallery-section-heading','.doctor-media-heading','.media-group-title','.trust-section>*','.doctor-cta','.contact-grid>section'
  ].join(','));
  revealItems.forEach((item,index)=>{
    item.classList.add('reveal-ready');
    item.style.setProperty('--reveal-delay',String(Math.min(index%5,4)*70)+'ms');
  });
  if (motionReduced || !('IntersectionObserver' in window)) {
    revealItems.forEach(item=>item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    },{threshold:.12,rootMargin:'0px 0px -30px'});
    revealItems.forEach(item=>revealObserver.observe(item));
  }
  const counters = $$('[data-count]');
  const runCounter = element => {
    const target = Number(element.dataset.count);
    const suffix=element.dataset.suffix||'';
    const display=value=>value.toLocaleString('en-IN')+suffix;
    if(!Number.isFinite(target)||motionReduced){element.textContent=display(target);return;}
    const started=performance.now(),duration=900;
    const tick=now=>{
      const progress=Math.min((now-started)/duration,1)
      element.textContent=display(Math.round(target*(1-Math.pow(1-progress,3))));
      if(progress<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && !motionReduced) {
    const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){runCounter(entry.target);counterObserver.unobserve(entry.target);}}),{threshold:.7});
    counters.forEach(counter=>counterObserver.observe(counter));
  } else counters.forEach(runCounter);
  const siteHeader=$('.site-header');
  const progressBar=document.createElement('span');
  progressBar.className='scroll-progress';
  progressBar.setAttribute('aria-hidden','true');
  siteHeader?.append(progressBar);
  let scrollFrame=0;
  const updateHeader=()=>{
    siteHeader?.classList.toggle('is-scrolled',window.scrollY>18);
    const available=document.documentElement.scrollHeight-window.innerHeight;
    progressBar.style.transform='scaleX('+(available>0?Math.min(window.scrollY/available,1):0)+')';
    scrollFrame=0;
  };
  const requestScrollUpdate=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateHeader);};
  updateHeader();
  window.addEventListener('scroll',requestScrollUpdate,{passive:true});
  const finePointer=window.matchMedia?.('(pointer: fine)')?.matches ?? false;
  const hero=$('.hero');
  if(hero&&finePointer&&!motionReduced){
    hero.addEventListener('pointermove',event=>{
      const rect=hero.getBoundingClientRect();
      hero.style.setProperty('--pointer-x',String((event.clientX-rect.left)/rect.width-.5));
      hero.style.setProperty('--pointer-y',String((event.clientY-rect.top)/rect.height-.5));
    });
    hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--pointer-x','0');hero.style.setProperty('--pointer-y','0');});
  }
  if(finePointer&&!motionReduced){
    $$('.service-card,.why-card,.profile-media-card,.gallery-card').forEach(card=>{
      card.classList.add('pointer-glow');
      card.addEventListener('pointermove',event=>{
        const rect=card.getBoundingClientRect();
        card.style.setProperty('--glow-x',(event.clientX-rect.left)+'px');
        card.style.setProperty('--glow-y',(event.clientY-rect.top)+'px');
      });
    });
  }
  const sectionLinks=$$('#main-nav a[href^="#"]');
  const linkSections=sectionLinks.map(link=>[link,$(link.getAttribute('href'))]).filter(([,section])=>section);
  if('IntersectionObserver' in window&&linkSections.length){
    const navObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      sectionLinks.forEach(link=>link.removeAttribute('aria-current'));
      linkSections.find(([,section])=>section===visible.target)?.[0].setAttribute('aria-current','page');
    },{rootMargin:'-30% 0px -60%',threshold:[0,.1,.4]});
    linkSections.forEach(([,section])=>navObserver.observe(section));
  }
  const labForm = $('#lab-form');
  if (!labForm) return;
  const checkboxes=$$('input[name="tests"]'),selectedList=$('#selected-list'),labReview=$('#lab-review');
  const selected=()=>checkboxes.filter(input=>input.checked).map(input=>input.value);
  function editLab(){labReview.hidden=true;labForm.hidden=false;checkboxes.forEach(input=>{input.disabled=false;});$('#clear-tests').disabled=false;}
  function updateTests(){
    const chosen=selected();$('#selected-count').textContent=`${chosen.length} selected`;
    $('#review-tests').disabled=!chosen.length;$('#review-tests').textContent=chosen.length?`Review ${chosen.length} Test${chosen.length===1?'':'s'} Request`:'Choose at least one test';
    checkboxes.forEach(input=>{$('.test-check',input.closest('label')).textContent=input.checked?'\u2713':'+';});
    selectedList.replaceChildren();
    if(!chosen.length){const empty=document.createElement('p');empty.className='muted small';empty.textContent='Your selected tests will appear here.';selectedList.append(empty);}
    chosen.forEach(name=>{const button=document.createElement('button');button.type='button';button.className='selected-chip';button.textContent=name+' \u00d7';button.setAttribute('aria-label','Remove '+name);button.addEventListener('click',()=>{editLab();checkboxes.find(input=>input.value===name).checked=false;updateTests();});selectedList.append(button);});
  }
  checkboxes.forEach(input=>input.addEventListener('change',()=>{editLab();updateTests();}));
  $('#clear-tests').addEventListener('click',()=>{editLab();checkboxes.forEach(input=>input.checked=false);updateTests();});
  $('#test-search').addEventListener('input',event=>{const term=event.target.value.trim().toLowerCase();checkboxes.forEach(input=>input.closest('label').hidden=!input.value.toLowerCase().includes(term));$('#no-results').hidden=checkboxes.some(input=>!input.closest('label').hidden);});
  $$('input[name="collection"]',labForm).forEach(input=>input.addEventListener('change',()=>{const home=$('input[name="collection"]:checked',labForm).value==='Home Collection';$('#address-field').hidden=!home;$('textarea[name="address"]',labForm).required=home;}));
  labForm.addEventListener('submit',event=>{
    event.preventDefault();const fields=getFields(labForm),chosen=selected();if(!validate(labForm,fields))return;
    if(!chosen.length){$('.form-error',labForm).textContent='Select at least one test.';return;}
    if(fields.collection==='Home Collection'&&!fields.address){$('.form-error',labForm).textContent='Enter your home collection address.';return;}
    const rows=[['Patient',fields.name],['Mobile',fields.phone],['Collection',fields.collection],['Preferred date',fields.date||'Earliest available slot'],['Address',fields.collection==='Home Collection'?fields.address:'Collection at clinic'],['Selected tests',chosen.map((name,n)=>`${n+1}. ${name}`).join('\n')]];
    showDetails($('.review-details',labReview),rows);
    const message=`Hello ${config.name},\nI would like to request lab tests.\n\n${rows.map(([key,value])=>`${key}: ${value}`).join('\n')}\n\nPlease confirm test availability, prices, any collection charges, preparation instructions and timing.`;
    $('#lab-send').href=whatsapp(message);labForm.hidden=true;labReview.hidden=false;labReview.setAttribute('tabindex','-1');labReview.focus();
  });
  $('#edit-lab').addEventListener('click',editLab);updateTests();
})();
