# Plantillas de Domi

Notebook templates for **Samsung Notes** (and any app that imports PDF or PNG), sized to the real
screen of each Galaxy Tab. Everything is generated in the browser: no account, no server, works offline.

**App:** https://djeldes75.github.io/plantillas/

## Features
- 6 sheet styles: lined, grid, dots, blank, Cornell, language.
- Galaxy Tab S9 / S9+ / S9 Ultra, S10+ / S10 Ultra, S11 / S11 Ultra, S12+ / S12 Ultra, and A4. Portrait or landscape.
- Light, dark, sepia and gray paper; any accent color; line spacing from 5 to 12 mm.
- Cover (4 designs), index, page numbers starting at any number (to continue a notebook).
- Vector PDF with vector text (sharp at any zoom) and PNG export.
- Interface in English, Español and Lietuvių.

## Install on the tablet
1. Open the app link in **Chrome** on the tablet.
2. Menu **⋮ → Add to home screen → Install**.

## Project structure
```
index.html            page + Content Security Policy
css/styles.css        styles
js/data.js            devices, styles, colors, translations
js/geometry.js        page measurements and row layout
js/font.js            Inter glyph outlines (vector text)
js/text.js            vector text engine
js/draw.js            drawing of sheets, cover and index
js/preview.js         live preview
js/pdf.js             hand-written vector PDF generator
js/app.js             UI, downloads, start-up, offline registration
sw.js                 offline cache
manifest.json, icons/ installable app
tests/verify.js       51 automatic checks (geometry, PDFs, PNGs, UI, CSP)
tools/build-single.js builds a one-file version in dist/
```

## Development
```
npm install
npx playwright install chromium   # once
npm test                          # needs qpdf, poppler-utils and python3-pil
npm run build:single              # dist/plantillas-single.html
```
Every push to `main` runs the tests on GitHub; the site is published **only if all of them pass**.
When you change any app file, bump `VERSION` in `sw.js` so installed tablets pick up the update.

## License
App code: [MIT](LICENSE). Inter font outlines: SIL OFL 1.1, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
Security: see [SECURITY.md](SECURITY.md).
