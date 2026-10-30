// Batería de pruebas de Plana. Uso: npm test  (o: node tests/verify.js)
// Batería de pruebas de "Plana".
// Corre todo en un navegador real (Chromium) y reporta PASA / FALLA por prueba.
const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

const http = require('http');
const path = require('path');

// Servidor local con los archivos del repositorio (así la política de seguridad se prueba de verdad)
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^([/\\])+/, '');
      const file = path.join(ROOT, p || 'index.html');
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass, detail });

(async () => {
  const srv = await serve();
  const BASE = `http://127.0.0.1:${srv.address().port}`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1000 }, acceptDownloads: true, locale: 'es-ES' });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const csp = [];
  p.on('console', m => { if (/Content Security Policy/i.test(m.text())) csp.push(m.text()); });
  await p.goto(BASE + '/index.html');

  // ---------- 1-4. GEOMETRÍA en todas las combinaciones ----------
  const geo = await p.evaluate(() => {
    const DEVS = DEVICES.map(d => d.id), ORI = ['portrait', 'landscape'];
    const STY = ['lined', 'grid', 'dotted', 'cornell', 'language', 'blank'];
    const SP = []; for (let s = 5; s <= 12; s += 0.5) SP.push(s);
    const r = { combos: 0, gaps: [], textHit: [], outside: [], boxBottom: [], headerHit: [], firstRow: [], topGap: [] }; const L0 = LANGS[state.lang];
    const oh = window.hline, ol = window.label;
    for (const dev of DEVS) for (const ori of ORI) for (const st of STY) for (const s of SP)
      for (const header of [true, false]) {
        state.device = dev; state.orient = ori; state.style = st;
        document.getElementById('spacing').value = s; document.getElementById('header').checked = header;
        const lines = [], labels = [];
        window.hline = (c, x0, x1, y) => { lines.push({ x0, x1, y }); oh(c, x0, x1, y); };
        window.label = (c, txt, x, y, col, size = 6.5, bold = true, align = 'left') => {
          const w = textWidth(txt, size, bold), h = size * PT;
          const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
          labels.push({ txt, x0, x1: x0 + w, top: y - h * 0.8, bot: y + h * 0.2 });
          ol(c, txt, x, y, col, size, bold, align);
        };
        const P = pageSize();
        render(drawPage, options(), 150);
        window.hline = oh; window.label = ol;
        r.combos++;
        const tag = `${dev}/${ori}/${st}/${s}mm${header ? '' : '/sin-recuadro'}`;
        // 1. renglones de la zona principal a distancia igual
        if (!['grid', 'dotted', 'blank'].includes(st)) {
          const isBox = st === 'cornell' || st === 'language';
          const lay = isBox ? layoutFromBottom(header ? 22 : 8, P.hMm - 9, s, st === 'cornell' ? 4 : 3) : null;
          const main = [...new Set(lines.filter(l => l.x0 === 0 && (!lay || l.y <= lay.sep + 0.001)).map(l => +l.y.toFixed(3)))].sort((a, b) => a - b);
          const g = main.slice(1).map((y, i) => y - main[i]).slice(st === 'lined' ? 0 : 1);
          if (g.some(x => Math.abs(x - s) > 0.02)) r.gaps.push(tag);
        }
        // 2. ninguna línea cruza un texto
        for (const L of labels) for (const ln of lines)
          if (ln.y > L.top + 0.05 && ln.y < L.bot - 0.05 && ln.x1 > L.x0 && ln.x0 < L.x1) { r.textHit.push(`${tag}: «${L.txt}»`); break; }
        // 3. todo dentro de la hoja
        if (lines.some(l => l.y < 0 || l.y > P.hMm || l.x0 < -0.01 || l.x1 > P.wMm + 0.01) ||
            labels.some(L => L.x0 < 0 || L.x1 > P.wMm || L.top < 0 || L.bot > P.hMm)) r.outside.push(tag);
        // 4. cajas de abajo: el último renglón cae en el borde de escritura (alto - 9 mm)
        if (st === 'cornell' || st === 'language') {
          const lay2 = layoutFromBottom(header ? 22 : 8, P.hMm - 9, s, st === 'cornell' ? 4 : 3);
          const box = lines.filter(l => l.x0 === 0 && l.y > lay2.sep + 0.001).map(l => l.y).sort((a, b) => a - b);
          const n = st === 'cornell' ? 4 : 3;
          const bg = box.slice(1).map((y, i) => y - box[i]);
          const lastY = box[box.length - 1], left = (P.hMm - 9) - lastY;
          if (box.length !== n || left < -0.01 || left >= s || bg.some(g => Math.abs(g - s) > 0.02)) r.boxBottom.push(tag);
          // la zona de apuntes empieza SIEMPRE pegada al recuadro (sin hueco variable)
          if (Math.abs(lay2.top - (header ? 22 : 8)) > 0.001) r.topGap.push(tag);
          // primer renglón: entre el final de la franja del título y la primera línea debe haber un renglón entero (s)
          const titleLab = labels.find(L => L.txt === L0.summary || L.txt === L0.phrases);
          if (!titleLab || Math.abs((box[0] - (lay2.sep + BOX_TITLE)) - s) > 0.02 || titleLab.bot > lay2.sep + BOX_TITLE + 0.01) r.firstRow.push(tag);
        }
        // 4b. la primera línea nunca invade el recuadro de tema y fecha
        if (header && lines.some(l => l.y > 6 && l.y < 19 + 2.9 && l.x0 === 0)) r.headerHit.push(tag);
      }
    return r;
  });
  const few = a => a.slice(0, 5).join(' | ') + (a.length > 5 ? ` … (+${a.length - 5})` : '');
  ok(`Renglones iguales (${geo.combos} combinaciones)`, !geo.gaps.length, few(geo.gaps));
  ok('Ninguna línea cruza un texto', !geo.textHit.length, few(geo.textHit));
  ok('Todo queda dentro de la hoja', !geo.outside.length, few(geo.outside));
  ok('Sin hueco: Ideas clave / Apuntes / Palabras nuevas pegados al recuadro', !geo.topGap.length, few(geo.topGap));
  ok('Cajas de resumen/frases: renglones iguales y completos, dentro de la hoja', !geo.boxBottom.length, few(geo.boxBottom));
  ok('Caja de abajo: el primer renglón es completo y el título no lo ocupa', !geo.firstRow.length, few(geo.firstRow));
  ok('Nada invade el recuadro de tema y fecha', !geo.headerHit.length, few(geo.headerHit));

  const mg = await p.evaluate(() => {
    const bad = []; const ov = window.vline;
    for (const st of ['language', 'cornell']) for (const ori of ['portrait', 'landscape']) for (const sp of [5, 6, 8, 12]) {
      state.style = st; state.orient = ori; document.getElementById('spacing').value = sp; document.getElementById('margin').checked = true;
      const vs = []; window.vline = (c, x, y0, y1) => { vs.push({ x, y0, y1 }); ov(c, x, y0, y1); };
      const P = pageSize(); render(drawPage, options(), 150); window.vline = ov;
      if (!vs.some(v => Math.abs(v.x - 15) < 0.01 && v.y1 >= P.hMm - 0.01)) bad.push(`${st}/${ori}/${sp}`);
    }
    return bad;
  });
  ok('El margen rojo llega hasta abajo en Idiomas y Cornell', !mg.length, mg.join(', '));

  // ---------- 5. TAMAÑOS reales de cada tablet ----------
  const sizes = await p.evaluate(() => DEVICES.map(d => {
    state.device = d.id; state.orient = 'portrait'; const P = pageSize();
    const c = render(drawPage, options());
    return { id: d.id, ratio: +(P.hMm / P.wMm).toFixed(3), px: [c.width, c.height], want: d.px || null, mm: [+P.wMm.toFixed(2), +P.hMm.toFixed(2)] };
  }));
  const badPx = sizes.filter(x => x.want && (x.px[0] !== x.want[0] || x.px[1] !== x.want[1]));
  ok('Cada tablet genera la imagen con su resolución exacta', !badPx.length, badPx.map(x => x.id).join(', '));
  const s10 = sizes.find(x => x.id === 's10plus');
  ok('Tab S10+ mide ~16.7 × 26.7 cm (±0.5 mm)', Math.abs(s10.mm[0] - 167.3) < 0.5 && Math.abs(s10.mm[1] - 267.4) < 0.5, s10.mm.join(' × ') + ' mm');

  // ---------- 6. TRADUCCIONES completas ----------
  const tr = await p.evaluate(() => {
    const keys = o => Object.keys(o).sort().join(',');
    const deep = o => Object.entries(o).flatMap(([k, v]) => typeof v === 'object' ? Object.keys(v).map(x => k + '.' + x) : [k]).sort().join(',');
    const ui = Object.values(UI).map(deep), tl = Object.values(LANGS).map(keys);
    const empty = Object.entries(UI).flatMap(([l, o]) => Object.entries(o).filter(([k, v]) => v === '' || v == null).map(([k]) => l + '.' + k));
    return { uiSame: ui.every(x => x === ui[0]), tlSame: tl.every(x => x === tl[0]), empty };
  });
  ok('App: ES, EN y LT tienen todos los textos', tr.uiSame && !tr.empty.length, tr.empty.join(', '));
  ok('Plantilla: ES, EN y LT tienen todos los textos', tr.tlSame);
  const vec = await p.evaluate(() => Object.values(LANGS).flatMap(o => Object.values(o).flatMap(v => typeof v === 'object' ? Object.values(v) : [v])).filter(t => !canVector(t.toUpperCase()) || !canVector(t)));
  ok('Todos los textos de la plantilla se dibujan como vector (sin respaldo)', !vec.length, vec.join(', '));
  for (const lang of ['ES', 'EN', 'LT']) {
    await p.click(`#appLang >> text=${lang}`);
    for (const tab of ['page', 'cover']) {
      await p.evaluate(t => { document.getElementById('cover').checked = true; state.previewPage = t; updatePreview(); }, tab);
      const bad = await p.evaluate(() => [...document.querySelectorAll('[data-t]')].filter(e => !e.hidden && e.offsetParent && (!e.textContent || /undefined/.test(e.textContent))).map(e => e.dataset.t));
      ok(`Interfaz en ${lang} (${tab === 'cover' ? 'portada' : 'hoja'}) sin textos vacíos`, !bad.length, bad.join(', '));
    }
  }
  await p.click('#appLang >> text=ES');
  await p.evaluate(() => { state.previewPage = 'page'; document.getElementById('cover').checked = false; updatePreview(); });

  // ---------- 7. NOMBRES de archivo ----------
  const names = await p.evaluate(() => {
    const out = {}; const set = (subj, st, th) => { document.getElementById('subject').value = subj; state.style = st; state.theme = th; state.fileEdited = false; updatePreview(); return document.getElementById('fname').value; };
    out.a = set('', 'lined', 'light'); out.b = set('Lituano', 'cornell', 'dark'); out.c = set('Física Cuántica!', 'grid', 'sepia');
    document.getElementById('fname').value = 'Mi/cuaderno:raro.pdf'; out.d = fileName('pdf');
    document.getElementById('subject').value = ''; state.style = 'lined'; state.theme = 'light';
    document.getElementById('fname').value = ''; out.e = fileName('png');
    document.getElementById('subject').value = ''; state.theme = 'light'; state.style = 'lined'; state.fileEdited = false; updatePreview();
    return out;
  });
  ok('Nombre automático: Notebook_Lined', names.a === 'Notebook_Lined', names.a);
  ok('Nombre con materia y modo: Lituano_Cornell_Dark', names.b === 'Lituano_Cornell_Dark', names.b);
  ok('Quita tildes y símbolos: Fisica-Cuantica_Grid_Sepia', names.c === 'Fisica-Cuantica_Grid_Sepia', names.c);
  ok('Nombre propio con caracteres prohibidos se limpia', names.d === 'Mi-cuaderno-raro.pdf', names.d);
  ok('Nombre vacío vuelve al automático', names.e === 'Notebook_Lined.png', names.e);

  // ---------- 8. PORTADAS ----------
  const cov = await p.evaluate(() => {
    const bad = []; const ol = window.label; let n = 0;
    for (const d of ['band', 'frame', 'block', 'minimal']) for (const th of Object.keys(THEMES)) for (const ori of ['portrait', 'landscape'])
      for (const dev of ['s9', 's10plus', 's12ultra', 'a4']) for (const t of ['Ok', 'Fundamentals of Software Engineering and Systems']) {
        state.coverDesign = d; state.theme = th; state.orient = ori; state.device = dev;
        document.getElementById('coverTitle').value = t; document.getElementById('coverSub').value = 'Vilnius Tech · Otoño 2026';
        document.getElementById('coverYear').checked = true; document.getElementById('coverYearText').value = '2026–2027';
        document.getElementById('coverName').checked = true; document.getElementById('coverNameText').value = 'Dominique Rodríguez';
        const P = pageSize(); const labs = [];
        window.label = (c, txt, x, y, col, size = 6.5, bold = true, align = 'left') => {
          const w = textWidth(txt, size, bold);
          const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x; labs.push({ txt, x0, x1: x0 + w, y, size });
          ol(c, txt, x, y, col, size, bold, align);
        };
        render(drawCover, options(), 150); window.label = ol; n++;
        const out = labs.filter(L => L.x0 < 3 || L.x1 > P.wMm - 3 || L.y < 3 || L.y > P.hMm - 3);
        if (out.length) bad.push(`${d}/${th}/${ori}/${dev}: ${out.map(o => o.txt).join(', ')}`);
        // el título no debe chocar con el subtítulo (orden vertical)
        const titleLines = labs.filter(L => L.size >= 12), sub = labs.find(L => L.txt.startsWith('Vilnius'));
        if (!labs.some(L => L.txt === 'Dominique Rodríguez')) bad.push(`${d}/${dev}: falta el nombre`);
        if (!labs.some(L => L.txt === '2026–2027')) bad.push(`${d}/${dev}: falta el año`);
        if (sub && titleLines.some(tl => Math.abs(tl.y - sub.y) < tl.size * PT * 0.9)) bad.push(`${d}/${ori}/${dev}: título toca subtítulo`);
      }
    document.getElementById('coverTitle').value = ''; document.getElementById('coverSub').value = ''; document.getElementById('coverYear').checked = false;
    state.theme = 'light'; state.orient = 'portrait'; state.device = 's10plus'; state.coverDesign = 'band';
    return { n, bad };
  });
  ok(`Portadas: textos dentro de la hoja y sin choques (${cov.n} combinaciones)`, !cov.bad.length, few(cov.bad));
  const yr = await p.evaluate(() => { document.getElementById('coverYear').checked = true; document.getElementById('coverYearText').value = '';
    return options().coverYearText; });
  ok('Año vacío = año actual (' + new Date().getFullYear() + ')', yr === String(new Date().getFullYear()), yr);
  const hints = await p.evaluate(() => ['es','en','lt'].every(l => UI[l].h_orient && UI[l].h_cyear && UI[l].ph_cname));
  ok('Avisos (orientación, año) en los 3 idiomas', hints);
  const contrast = await p.evaluate(() => [onColor('#FFE600'), onColor('#1A237E')]);
  ok('Portada Bloque: texto oscuro en color claro y blanco en color oscuro', contrast[0] === '#222222' && contrast[1] === '#FFFFFF', contrast.join(' / '));

  const clamp = await p.evaluate(() => { const el = document.getElementById('pages'); const r = [];
    for (const v of ['300', '1000', '9999', '12000', '0']) { el.value = v; el.dispatchEvent(new Event('change')); r.push(el.value + '→' + options().pages); }
    el.value = '60'; el.dispatchEvent(new Event('change')); return r; });
  ok('Hojas: acepta hasta 9999 y corrige en el campo lo que se pasa (' + clamp.join(', ') + ')', clamp.join() === '300→300,1000→1000,9999→9999,9999→9999,1→1', clamp.join());

  // ---------- 9. PDFs reales: válidos, páginas y tamaño ----------
  const cases = [
    { dev: 's10plus', ori: 'portrait', st: 'lined', th: 'light', cover: false, index: false, pages: 60, expect: 60 },
    { dev: 's12ultra', ori: 'landscape', st: 'cornell', th: 'dark', cover: true, mode: 'inside', index: true, pages: 10, expect: 12 },
    { dev: 's12ultra', ori: 'landscape', st: 'cornell', th: 'dark', cover: true, mode: 'separate', index: true, pages: 10, expect: 11 },
    { dev: 's11', ori: 'portrait', st: 'language', th: 'sepia', cover: true, mode: 'inside', index: false, pages: 1, expect: 2 },
    { dev: 's11', ori: 'portrait', st: 'language', th: 'sepia', cover: true, mode: 'separate', index: false, pages: 1, expect: 1 },
    { dev: 'a4', ori: 'portrait', st: 'dotted', th: 'gray', cover: false, index: true, pages: 100, expect: 101 },
    { dev: 's10plus', ori: 'portrait', st: 'lined', th: 'light', cover: false, index: false, pages: 9999, expect: 9999 },
    { dev: 's10plus', ori: 'portrait', st: 'language', th: 'light', cover: false, index: false, pages: 20, start: 61, expect: 20, lastNum: 80 },
  ];
  for (const c of cases) {
    await p.evaluate(c => { state.coverMode = c.mode || 'separate'; state.device = c.dev; state.orient = c.ori; state.style = c.st; state.theme = c.th;
      document.getElementById('cover').checked = c.cover; document.getElementById('index').checked = c.index;
      document.getElementById('pages').value = c.pages; document.getElementById('startNum').value = c.start || ''; state.fileEdited = false; updatePreview(); }, c);
    const P = await p.evaluate(() => pageSize());
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#dlPdf')]);
    const f = `/tmp/verify-${c.dev}-${c.st}-${c.mode || 'x'}.pdf`; await dl.saveAs(f);
    let check = '';
    try { check = execSync(`qpdf --check ${f} 2>&1`).toString(); } catch (e) { check = e.stdout.toString(); }
    const info = execSync(`pdfinfo ${f}`).toString();
    const pages = +info.match(/Pages:\s+(\d+)/)[1];
    const [w, h] = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/).slice(1).map(Number);
    const sizeOk = Math.abs(w / 72 * 25.4 - P.wMm) < 0.2 && Math.abs(h / 72 * 25.4 - P.hMm) < 0.2;
    const kb = Math.round(fs.statSync(f).size / 1024);
    ok(`PDF ${c.dev} ${c.ori} ${c.st} ${c.th}${c.cover ? ' portada ' + (c.mode === 'inside' ? 'dentro' : 'aparte') : ''}: válido, ${c.expect} páginas, tamaño correcto (${kb} KB)`,
       /No syntax or stream encoding errors/.test(check) && pages === c.expect && sizeOk,
       `qpdf:${/No syntax/.test(check) ? 'ok' : 'error'} páginas:${pages} tamaño:${(w / 72 * 25.4).toFixed(1)}×${(h / 72 * 25.4).toFixed(1)} mm`);
    // los números de página empiezan después de portada/índice
    const txt = execSync(`pdftotext -f ${c.expect} -l ${c.expect} ${f} -`).toString().trim();
    const want = String(c.lastNum || c.expect);
    ok(`  └ número de la última página = ${want}`, txt === want, `leído: "${txt}"`);
    if (c.start) { const t1 = execSync(`pdftotext -f 1 -l 1 ${f} -`).toString().trim(); ok(`  └ la primera hoja empieza en ${c.start}`, t1 === String(c.start), `leído: "${t1}"`); }
  }

  await p.evaluate(() => { document.getElementById('startNum').value = ''; updatePreview(); });
  // ---------- 10. PNG ----------
  await p.evaluate(() => { state.device = 's10plus'; state.orient = 'portrait'; updatePreview(); });
  const [dpng] = await Promise.all([p.waitForEvent('download'), p.click('#dlPng')]);
  await dpng.saveAs('/tmp/verify.png');
  const dim = execSync(`python3 -c "from PIL import Image; print(*Image.open('/tmp/verify.png').size)"`).toString().trim();
  ok('PNG de la S10+ mide 1752 × 2800 píxeles', dim === '1752 2800', dim);

  await p.evaluate(() => { state.style = 'lined'; state.theme = 'light'; document.getElementById('cover').checked = true; document.getElementById('subject').value = 'Lituano'; state.fileEdited = false; state.previewPage = 'cover'; updatePreview(); });
  const [dc] = await Promise.all([p.waitForEvent('download'), p.click('#dlCover')]);
  await dc.saveAs('/tmp/verify-cover.png');
  const cdim = execSync(`python3 -c "from PIL import Image; print(*Image.open('/tmp/verify-cover.png').size)"`).toString().trim();
  ok('Portada aparte: PNG de 1752 × 2800 llamado Lituano_Lined_Cover.png', cdim === '1752 2800' && dc.suggestedFilename() === 'Lituano_Lined_Cover.png', cdim + ' ' + dc.suggestedFilename());
  await p.evaluate(() => { document.getElementById('subject').value = ''; document.getElementById('cover').checked = false; state.previewPage = 'page'; updatePreview(); });

  // ---------- 11. Interfaz: pestañas y panel de portada ----------
  const ui = await p.evaluate(() => {
    const r = {};
    document.getElementById('cover').checked = false; document.getElementById('index').checked = false; state.previewPage = 'page'; updatePreview();
    r.onlyPage = document.querySelectorAll('#pvTabs button').length === 1;
    document.getElementById('cover').checked = true; document.getElementById('cover').dispatchEvent(new Event('change'));
    r.jumpsToCover = state.previewPage === 'cover' && !document.getElementById('coverControls').hidden && document.querySelector('.step.pg').hidden;
    document.getElementById('backToPage').click();
    r.back = state.previewPage === 'page' && document.getElementById('coverControls').hidden && !document.querySelector('.step.pg').hidden;
    state.style = 'blank'; updatePreview(); r.noMarginCornell = document.getElementById('marginRow').style.display === 'none';
    state.style = 'cornell'; updatePreview(); r.marginLined = document.getElementById('marginRow').style.display !== 'none';
    return r;
  });
  ok('Sin portada ni índice solo aparece la pestaña "Hoja"', ui.onlyPage);
  ok('Al marcar Portada, salta a la portada y cambia el panel', ui.jumpsToCover);
  ok('"Volver a la hoja" regresa al panel de la hoja', ui.back);
  ok('La opción de margen se esconde en En blanco y aparece en Cornell', ui.noMarginCornell && ui.marginLined);

  const th = await p.evaluate(() => {
    const bg = () => getComputedStyle(document.body).backgroundColor;
    const a = document.documentElement.dataset.theme, b0 = bg();
    document.getElementById('themeBtn').click(); const b = document.documentElement.dataset.theme, b1 = bg();
    let saved = null; try { saved = localStorage.getItem('uiTheme'); } catch (e) {}
    document.getElementById('themeBtn').click();
    return { ok: a !== b && b0 !== b1 && saved === b && document.documentElement.dataset.theme === a };
  });
  ok('El botón de tema cambia entre claro y oscuro y lo recuerda', th.ok);
  // ---------- Recordar opciones ----------
  await p.evaluate(() => { state.style = 'grid'; state.device = 's9'; state.accent = '#123abc';
    document.getElementById('spacing').value = '6.5'; document.getElementById('subject').value = 'Química'; updatePreview(); });
  await p.reload(); await p.waitForTimeout(600);
  const kept = await p.evaluate(() => ({ style: state.style, device: state.device, accent: state.accent,
    sp: document.getElementById('spacing').value, subj: document.getElementById('subject').value, sel: document.getElementById('device').value }));
  ok('Recuerda tus opciones al volver a abrir la app', kept.style === 'grid' && kept.device === 's9' && kept.accent === '#123abc' && kept.sp === '6.5' && kept.sel === 's9', JSON.stringify(kept));
  ok('No recuerda lo de cada cuaderno (el tema escrito)', kept.subj === '', kept.subj);
  // datos guardados dañados o con trampas: se ignoran sin errores
  await p.evaluate(() => localStorage.setItem('settings', JSON.stringify({ v: 1, state: { device: '<img src=x>', accent: 'red;}', style: 'grid' }, fields: { spacing: 'x'.repeat(500), cover: 'yes' } })));
  await p.reload(); await p.waitForTimeout(600);
  const bad = await p.evaluate(() => ({ device: state.device, accent: state.accent, style: state.style, sp: document.getElementById('spacing').value.length }));
  ok('Si lo guardado está dañado, lo ignora y usa lo de fábrica', bad.device === 's10plus' && /^#[0-9a-f]{6}$/i.test(bad.accent) && bad.style === 'grid' && bad.sp < 10, JSON.stringify(bad));
  await p.evaluate(() => document.getElementById('resetBtn').click()); await p.waitForTimeout(700);
  const reset = await p.evaluate(() => ({ style: state.style }));
  ok('El botón "Volver a las opciones de fábrica" funciona', reset.style === 'lined', JSON.stringify(reset));
  const df = await p.evaluate(() => { const r = []; for (const l of ['es','en','lt']) { state.lang = l; r.push(dateFmt()); }
    state.lang = 'en'; buildChips(); updatePreview(); return { r, ui: !!document.getElementById('dateFmtChips') }; });
  ok('Formato de fecha oficial y fijo por idioma (ES día/mes/año, EN mes/día/año, LT año-mes-día)', df.r.join() === 'dmy,mdy,ymd' && !df.ui, JSON.stringify(df));
  ok('La política de seguridad (CSP) no bloquea nada de la app', !csp.length, csp.slice(0, 3).join(' | '));
  ok('Cero errores en la consola durante todas las pruebas', !errs.length, errs.slice(0, 3).join(' | '));
  await b.close(); srv.close();

  const pass = results.filter(r => r.pass).length;
  console.log(results.map(r => `${r.pass ? 'PASA ' : 'FALLA'}  ${r.name}${!r.pass && r.detail ? '\n        → ' + r.detail : ''}`).join('\n'));
  console.log(`\n${pass} de ${results.length} pruebas pasan`);
  process.exit(pass === results.length ? 0 : 1);
})();
