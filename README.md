# Known Before Built — website

The whole page is `index.html` (layout, styles and scripts in one file).
`assets/` holds the images, `fonts/` the self-hosted fonts.

Before launch, in `index.html`:
- Replace `https://form.typeform.com/to/[PLACEHOLDER]` (2×) with your Typeform link.
- Set `showPlaceholders: true` to `false` to hide the orange [PLACEHOLDER] markers.
- Fill in `impressum.html` and `privacy.html`.
- Portrait: save your round photo as `assets/portrait.png` (square, at least 720 × 720 px, transparent corners fine). It replaces the dashed circle automatically.

When the domain is bought: add it under Settings → Pages → Custom domain (GitHub creates the CNAME file),
then ask for the canonical / share-image URLs to be set to the domain.

Publisher page: put it in a folder `grant-and-bear-publishing/` with its own `index.html` (the footer links there).
