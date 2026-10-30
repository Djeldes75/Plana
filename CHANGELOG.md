# Changelog

## 2.7.1 - 2026-10-30
- Up to 9999 writing pages per PDF (was 1000). 9999 pages is about 8 MB.

## 2.7.0 - 2026-10-30
- Up to 1000 writing pages per PDF (was 100). Pages share one template, so 1000 pages is still only about 0.7 MB.
- If you type a number out of range, the field now corrects itself so you see how many pages you will get.

## 2.6.2 - 2026-10-30
- The date format is now fixed to the official one of each template language (Spanish DD/MM/YYYY, English US MM/DD/YYYY, Lithuanian YYYY-MM-DD); the option was removed.

## 2.6.1 - 2026-10-30
- Lithuanian date box: year guide shows YYYY (YYYY-MM-DD), not MMMM, which was easy to confuse with the month.

## 2.6.0 - 2026-10-30
- Date box: choose DD/MM/YYYY, MM/DD/YYYY or YYYY-MM-DD (default follows the template language), with faint guide letters for each part.
- Language sheet: the second column is now "Translation" (Traducción / Vertimas) instead of "Meaning".

## 2.5.1 - 2026-10-29
- Repository renamed to `Plana`; new address https://djeldes75.github.io/Plana/ (links updated).

## 2.5.0 - 2026-10-29
- New name: **Plana** (same in English, Spanish and Lithuanian), signed "by Domi". The web address stays the same.

## 2.4.0 — 2026-10-29
- Computer (mouse): more compact interface, so it fits at 100% zoom.
- README with screenshots, badges and a guide; issue templates.

## 2.3.0 — 2026-10-29
- Remembers your options (tablet, sheet type, spacing, paper, colors, extras, pages, your name) between visits.
- Per-notebook things are not remembered: subject, cover title/subtitle, start number, file name.
- Damaged or tampered saved data is ignored safely.
- "Reset to default options" button.

## 2.2.0 — 2026-10-29
- Dark theme for the app ("night blue"). Follows the tablet/PC setting until you choose; the moon/sun button remembers your choice.
- Version number shown under the language buttons.
- Offline mode always checks for a newer version first.

## 2.1.1 — 2026-10-29
- Shorter help texts (orientation, continue a notebook); removed the template-language and cover-name hints.
- Spanish: "Horizontal" instead of "Horizontal (acostada)".

## 2.1.0 — 2026-10-29
- New look: "cloud blue" colors, dotted-notebook background, each step in its own card.
- Landscape: the sheet in the middle, options on both sides.
- Portrait: bigger sheet fixed at the top (tap it to enlarge), options scroll below.
- Small drawings on the sheet-type and orientation buttons; bigger text and buttons for the S Pen.
- Download bar always visible at the bottom.

## 2.0.0 — 2026-10-29
- Professional structure: `css/`, `js/` (one file per part of the app), `icons/`, `tests/`, `tools/`.
- Security: Content Security Policy, no-referrer, no inline scripts or styles, `SECURITY.md`.
- Licenses: MIT for the app, SIL OFL 1.1 notice for the Inter font.
- Automatic tests (51 checks) on every change, and automatic publishing to GitHub Pages only if they pass.
- Offline cache updated to `plantillas-v2`.

## 1.0.0 — 2026-10-28
- First installable version (single file): 6 sheet styles, 10 tablet sizes + A4, light/dark/sepia/gray paper,
  EN/ES/LT, covers, index, vector PDF with vector text, PNG export.
