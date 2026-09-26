# chintzcreative

Static site, plain HTML. No build step and no runtime, so every word is readable by Google and AI crawlers.

    index.html               home: watercolors lead, featured piece, gallery, process, FAQ, On chintz
    custom-watercolor.html   /custom-watercolor
    hand-lettering.html      /hand-lettering  (includes chalkboard art)
    birthday-banners.html    /birthday-banners  (birthday, graduation, shower banners)
    hand-painted-gifts.html  /hand-painted-gifts  (ornaments, cutting boards, paddles, notebooks)
    commission.html          /commission  (4-step intake form)
    keepsake-board.html      /keepsake-board  (lay out a watercolor, see an estimate, send it to Bailey)
    interior-design.html     hidden for now: not linked, noindex, not in sitemap
    thanks.html              form landing page (noindex)
    404.html
    robots.txt  sitemap.xml  llms.txt  _headers
    assets/                  site.css, theme.js (colourway dial), intake.js, keepsake-board.css/.js, favicon.svg, images

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

## Keepsake board (/keepsake-board)
Customers upload photos, add dates or words, drag and resize them on a to-scale sheet of paper, pick a size and frame, and send the board to Bailey. The email arrives through FormSubmit with a table of the order, a picture of the layout (`keepsake-layout.jpg`) and each photo (`04-name.jpg`), numbered to match the item list. Photos are shrunk in the browser so a board stays under FormSubmit's 10 MB limit.

**Changing prices:** everything is in `CONFIG` at the top of `assets/keepsake-board.js`. Base price is painting hours × `RATE` ($25): 2, 4, 6 and 8 hours for the four sizes. Hours are never shown to customers.

| Paper | Mat window | Frame | Price | Items included | Most items | Frame price |
|---|---|---|---|---|---|---|
| 8.5 × 11 | 7.5 × 9.5 | 11 × 14 | $50 | 5 | 7 | $25 |
| 11 × 14 | 10.5 × 13.5 | 16 × 20 | $100 | 8 | 10 | $35 |
| 16 × 20 | 15.5 × 19.5 | 20 × 24 | $150 | 12 | 14 | $55 |
| 18 × 24 | 17.5 × 23.5 | 22 × 28 | $200 | 15 | 17 | $75 |

Extra items are $5 each, up to two (`extraItems`). Past that, or once items cover 65% of the mat window (`maxFill`), the piece has to move up a size.

**Frame costs behind the frame prices (Hobby Lobby, everyday 40% off, September 2026):**

| Frame | Store price | Cost with 7.25% tax | Charge | Margin |
|---|---|---|---|---|
| 11 × 14, 8 × 10 mat | $17.99 (Michaels $31.99) | $19.29 | $25 | $5.71 |
| 16 × 20, 11 × 14 mat | about $23.99 | $25.73 | $35 | $9.27 |
| 20 × 24 + mat | $25.19 + about $6 | $33.45 | $55 | $21.55 |
| 22 × 28 + mat | about $36 + $12 (estimate) | $51.48 | $75 | $23.52 |

Check the 16 × 20 and 22 × 28 prices in the Raleigh or Knightdale stores. Buy Michaels frames only on sale. If a gold or wood style costs more than black at a size, price that size from the most expensive style.

**FormSubmit activation:** FormSubmit activates each web address separately. After this page first goes live, send one test board from chintzcreative.com/keepsake-board and click the activation link in Bailey's inbox. A board held for activation arrives without its attachments, so send the test again after activating.

**Open questions:**
- Tiny accents (trees, drumsticks) count as items today, so the 1986 · BEK piece would be 9 items and need 11 × 14. They could be made free like the flourishes.
- Dates and short words count as items. They could be free lettering instead.
- `example_photos/` (local only, git-ignored) holds cropped sample emblems for testing uploads. They are team and car logos, so they are not published.
