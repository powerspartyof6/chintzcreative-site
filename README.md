# chintzcreative

Static site. Four pages plus the runtime script.

    index.html            Home — hero, chintz manifesto, practice, about
    interior-design.html
    watercolors.html
    weddings.html
    support.js            required by all four pages

## Deploy on Cloudflare Pages

Commit the contents of this folder to the repo root. In Cloudflare Pages:

- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: `/`

## Editing

Each page is one HTML file. Markup sits between `<x-dc>` and `</x-dc>`; styling is inline.
The Instagram handle is set in the `Component` class at the bottom of each file
(`this.props.instagramHandle ?? "chintzcreative"`).

Image placeholders are the striped boxes labelled in monospace — replace each with an
`<img>` at the same aspect ratio.
