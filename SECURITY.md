# Security

## How the app protects you

- **Everything runs on your device.** The app has no server, no accounts, no analytics and no cookies.
  Templates are generated in the browser and nothing you type leaves the tablet.
- **Strict Content Security Policy.** `index.html` only allows code, styles, fonts and images from
  this same site (`default-src 'self'`), blocks plugins (`object-src 'none'`), forms and `<base>` tags,
  and the tests fail if the policy blocks anything or if the app logs an error.
- **No third-party code.** No external libraries or CDNs; the PDF generator is written by hand.
- **No referrer.** `no-referrer` prevents leaking the page address to other sites.
- **Offline cache only stores this site's own files** (see `sw.js`).

## Reporting a problem

If you find a security issue, please **do not open a public issue**. Use GitHub's
*Security → Report a vulnerability* (private reporting) on this repository.
