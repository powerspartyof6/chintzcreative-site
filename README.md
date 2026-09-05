# chintzcreative

Single page static site.

    index.html    the site
    support.js    required runtime, must sit beside index.html

## Deploy on Cloudflare Pages

Commit both files to the repo root (powerspartyof6/chintzcreative). In Cloudflare Pages:

- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: `/`

## Contact form

The form posts to https://formsubmit.co/mrs.baileypowers@gmail.com — no server needed.
The FIRST submission after going live triggers a confirmation email to that address;
click the link in it once and every later submission arrives in the inbox.

## Colourway dial

The six swatches in the sidebar switch the whole site palette and remember the
visitor's choice. The starting palette is set by `defaultColourway` in the
`Component` class near the bottom of index.html ("ivory", "madder", "ochre",
"leaf", "china", "clay").

## Images

Striped boxes are placeholders labelled in monospace. Replace each with an `<img>`
at the same aspect ratio.
