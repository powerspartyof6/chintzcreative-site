# chintzcreative

Static site, plain HTML. No build step and no runtime, so every word is readable by Google and AI crawlers.

    index.html               home: watercolors lead, featured piece, gallery, process, FAQ, On chintz
    custom-watercolor.html   /custom-watercolor
    hand-lettering.html      /hand-lettering  (includes chalkboard art)
    birthday-banners.html    /birthday-banners  (birthday, graduation, shower banners)
    hand-painted-gifts.html  /hand-painted-gifts  (ornaments, cutting boards, paddles, notebooks)
    commission.html          /commission  (4-step intake form)
    interior-design.html     hidden for now: not linked, noindex, not in sitemap
    thanks.html              form landing page (noindex)
    404.html
    robots.txt  sitemap.xml  llms.txt  _headers
    assets/                  site.css, theme.js (colourway dial), intake.js, favicon.svg, images

Delete support.js and any older .html files from the repo before pushing.

## Deploy (Cloudflare Pages)
Preset **None**, no build command, output directory `/`. Clean URLs (/hand-lettering) work automatically.

## Contact form (FormSubmit, free)
1. After deploying, submit the form once yourself. FormSubmit emails mrs.baileypowers@gmail.com an activation link. Click it.
2. Optional: FormSubmit then provides a random alias address. Swap it into the form `action` in commission.html to hide the real email from spam bots.
3. Visitors land on /thanks after sending and receive an automatic confirmation email.

## Un-hiding Interior design
Add `<a href="/interior-design">Interiors</a>` back to the header nav and footer of each page, change its robots meta to `index, follow`, add it to sitemap.xml and llms.txt, and restore the "Interior design" choice in commission.html.

## After going live
1. Google Search Console: verify the domain, submit sitemap.xml, request indexing for each page.
2. Bing Webmaster Tools: import from Search Console (feeds ChatGPT search and Copilot).
3. Google Business Profile: category Artist, service-area business, link to /commission.
4. Instagram bio link: chintzcreative.com/commission.
5. Ask clients for Google reviews that name the piece ("custom 40th birthday watercolor").

## Adding photos
Resize to about 1000px wide. Name the file with search words (hand-painted-first-birthday-banner-pink.jpg). Add inside the page's `<div class="gallery">`:

    <figure style="margin:0;display:grid;gap:10px"><img src="assets/FILE.jpg" width="1000" height="1250" loading="lazy" alt="What it is, occasion, details" style="width:100%;aspect-ratio:4/5;object-fit:cover"><figcaption class="mono" style="color:var(--muted);font-size:11px">Caption</figcaption></figure>

Then add the image to sitemap.xml under that page.
