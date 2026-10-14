# Elite Health Care

Fast static hospital website based on the client-supplied reference. Separate from PROCARE.

## Local commands

Requires Node.js 22 or newer.

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run dev
```

Preview defaults to http://localhost:5174. If that port is busy, the server tries the next free port and prints the actual URL.

The site contains `/`, `/lab-tests`, and `/gallery`. All three are generated as real HTML files. Appointments, pharmacy, day care, checkups and report requests use WhatsApp drafts. Visitors must send their message and wait for reception confirmation. No backend, patient storage, payment collection, fake booking references or generated medical reports.

## Cloudflare Pages: free static hosting

Recommended: connect this GitHub repository in Cloudflare Pages.

1. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git.
2. Select `saiganesh3191/Elite_care-hospital`, production branch `main`.
3. Project name: `elite-care-hospital` (or another available name).
4. Framework preset: None. Build command: `npm run build`. Output directory: `dist`. Node.js version: 22 or newer.
5. If your project name or domain differs, set `SITE_URL` to the production HTTPS origin before building so canonical URLs, robots.txt and sitemap.xml are correct.
6. Deploy. Future pushes to `main` rebuild automatically.

The default target origin is `https://elite-care-hospital.pages.dev`; this is a configuration target, not evidence of a live deployment. Verify the URL returned by Cloudflare. For a custom domain, add it through Pages and update `SITE_URL`.

Direct upload alternative after signing into Cloudflare:

```sh
npm run build
node node_modules/wrangler/bin/wrangler.js login
node node_modules/wrangler/bin/wrangler.js pages project create elite-care-hospital --production-branch main
node node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name elite-care-hospital --branch main
```

Choose Git integration initially if you want automatic deploys from GitHub. Cloudflare does not allow switching a Direct Upload project to Git integration in place.

Cloudflare documentation currently states that static asset requests are free and unlimited: https://developers.cloudflare.com/pages/functions/pricing/#static-asset-requests . Free plan build/file limits still apply: https://developers.cloudflare.com/pages/platform/limits/ . There are no Pages Functions in this project. No provider can be guaranteed to keep the same pricing forever.

## Content and images

- Update clinic information in `src/clinic.mjs`. Current phone: +91 99664 47044.
- User-provided assets: `public/images/logo.png` and `public/images/profile.png`.
- Service images are illustrative WebP photos reused from the user's earlier project, not clinic photography.
- The lab catalog is for enquiries only. Elite-specific prices are confirmed by reception, not copied from PROCARE.
- See `CONTENT-SOURCES.md` for provenance.
- Do not copy credentials into source files. Do not replace another deployment repository wholesale; port relevant changes after inspecting its latest code.

## Performance

No React runtime, font CDN, icon CDN, analytics scripts, server functions or API calls. Compressed service images, lazy loading, explicit image dimensions, static HTML content, hashed CSS/JavaScript with immutable caching, semantic headings, metadata, JSON-LD and a three-URL sitemap. The client JavaScript is less than 15 KB uncompressed.
