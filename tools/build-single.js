// Junta index.html + css + js en UN solo archivo (dist/plantillas-single.html).
// Sirve para la versión de Claude (artefacto) o para abrir la app sin servidor.
// Uso: npm run build:single
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, f) =>
  `<style>\n${fs.readFileSync(path.join(ROOT, f), 'utf8')}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) =>
  `<script>\n${fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/<\/script/gi, '<\\/script')}\n</script>`);
// Sin servidor no hay manifiesto, iconos ni CSP de 'self' que cumplir.
html = html.replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, '')
           .replace(/\s*<link rel="(manifest|icon|apple-touch-icon)"[^>]*>/g, '');

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
const out = path.join(ROOT, 'dist', 'plantillas-single.html');
fs.writeFileSync(out, html);
console.log(`OK: ${path.relative(ROOT, out)} (${Math.round(html.length / 1024)} KB)`);
