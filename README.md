# IB-Prelogin: static mirror of qa.indiabullssecurities.com

A dependency-free static mirror of the Indiabulls Securities pre-login site.
Plain HTML, CSS and images, with no build step, no framework, no npm.

Captured **11 Aug 2026** from `https://qa.indiabullssecurities.com`.

## Run it

```bash
python3 serve.py          # http://localhost:8000
python3 serve.py 9000     # custom port
```

A server is required, pages use root-relative URLs (`/bonds`, `/assets/…`),
which do not resolve over `file://`.

## What's here

| | |
|---|---|
| Pages | 222 |
| HTML | 22.6 MB |
| Assets (images, CSS, fonts, PDFs) | 74.5 MB |
| JS | one 4.5 KB file (`assets/site.js`) |

```
index.html                 home
<page>/index.html          221 more pages, path matches the live URL
assets/
  <host>/…                 every image, stylesheet, font and PDF the pages
                           reference, filed under its origin host
  site.css  site.js        mirror runtime (see "Reconstructed" below)
serve.py                   local static server
```

Page paths mirror live URLs exactly, so `/calculators/sip-calculator` on QA is
`calculators/sip-calculator/index.html` here.

### Page groups

- **48** marketing / product pages (`/bonds`, `/ipo`, `/mutual-fund`, `/pricing`, …)
- **27** calculators (`/calculators/*`)
- **141** stock detail pages (`/stock/<company>`)
- **6** IPO detail pages (`/ipo/<company>`)

## How it was made

The source site is a Next.js app that server-renders its markup. The mirror
keeps that rendered markup byte-for-byte and strips everything that only
existed to make React work:

- the inline `self.__next_f.push(…)` RSC payload, roughly half of every page
- 69 JS chunks (8.8 MB)
- analytics tags

Asset URLs are then repointed at the local copies under `assets/`.
Verified after every build: no page loses more than 3% of its visible text,
and every `/assets/…` reference resolves to a file that exists.

`<link rel="canonical">` and `og:*` tags still point at the live QA host. That
is deliberate, they describe the original page, not the mirror.

## Reconstructed, not copied

Two things the live site builds in the browser, which a JS-free mirror has to
supply itself. Both are marked so they aren't mistaken for captured markup.

**1. Mega-menu panels.** The server-rendered HTML contains only the
`Products / Markets / Pricing / More` triggers, the panel contents never
appear in it. The markup in `assets/site.css` + `assets/site.js` (class prefix
`ibx-`) was rebuilt from the menu definition inside the site's own header
chunk, so the labels, groupings and destinations are the site's, but the
markup and styling are ours.

**2. Collapsed FAQ answers.** React only renders the answer of the FAQ that is
currently open, so 95 of the 119 answers across 24 pages were absent from the
captured HTML. They were restored from each page's own `FAQPage` JSON-LD, the site's own content, re-attached where the DOM would have shown it.

The theme toggle is inert. The mirror is captured in the dark theme the site
serves by default.

## Known-broken on the source site

Reproduced faithfully rather than silently fixed:

- `/research-and-ideas`, the "Share Market News" menu item 404s
- `…/prelogin/assetshome/panel-bg_desktop.png`, missing `/` between `assets`
  and `home`; 404 (5 references)
- `company-logos/80/lloydsent.webp`, `company-logos/80/ltm.webp`, 404
- `/calculators/elss-calculator` and `/coming-soon` serve the generic homepage
  `<title>` and meta description instead of their own
- 15 menu entries are flagged `guess: true` in the site's own source, meaning
  their destinations were never confirmed, `/research-and-ideas` is one of them

## Rebuilding

Raw capture lives in `../mirror-qa/` (122 MB): untouched HTML, all assets, plus
`_content/*.json`, a structured extraction of every page (SEO head, heading
outline, section-by-section copy, CTAs, images, FAQs). That extraction is the
working input for planning page-level changes.
