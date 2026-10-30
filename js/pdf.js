// DESCARGAS Y PDF
// Nombres de archivo, generador de PDF vectorial (sin librerías) y PNG.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// 5. DESCARGAS
// ---------------------------------------------------------------
let downloads = null;
function msg(s) { document.getElementById("msg").textContent = s; }

// Nombre automático, corto y en inglés: Materia_Tipo_Color  (ej. Notebook_Lined, Lithuanian_Cornell_Dark)
function clean(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
function autoName() {
  const o = options();
  const subj = clean(o.subject) || (o.cover ? clean(o.coverTitle) : "") || "Notebook";
  return [subj, STYLE_FILE[state.style], THEME_FILE[state.theme]].filter(Boolean).join("_");
}
function fileName(ext) {
  const typed = document.getElementById("fname").value.trim().replace(/\.(pdf|png)$/i, "");
  return (typed.replace(/[\\/:*?"<>|]+/g, "-") || autoName()) + "." + ext;
}

async function save(filename, blob) {
  const t = T();
  if (downloads) {
    try { await downloads.save({ filename, data: blob }); msg(t.done + filename); }
    catch (e) { msg(e && e.code === "declined" ? t.declined : t.fail); }
  } else {                       // fuera de Claude: descarga normal del navegador
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    msg(t.done + filename);
  }
}

// ===============================================================
// PDF VECTORIAL
// Las mismas funciones de dibujo (drawPage, drawCover, drawContents)
// dibujan sobre un "lienzo PDF" en vez de un canvas: cada línea se
// guarda como instrucción vectorial, así se ve nítida a cualquier zoom.
// Los textos se guardan como imágenes muy finas (600 ppp) con fondo
// transparente, para que las letras lituanas (ą, ė, ų…) salgan bien.
// ===============================================================
const MM = 72 / 25.4;                       // milímetros → puntos PDF
const TEXT_RES = 24;                        // píxeles por mm para los textos (~610 ppp)
const measureCtx = document.createElement("canvas").getContext("2d");

function pdfColor(hex) { return [1, 3, 5].map(i => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(" "); }
const n2 = v => (+v).toFixed(2);

class PdfCanvas {
  constructor(wMm, hMm) {
    this.w = wMm; this.h = hMm; this.ops = []; this.texts = []; this.path = [];
    this.fillStyle = "#000000"; this.strokeStyle = "#000000"; this.lineWidth = 0.1;
    this.textAlign = "left"; this.textBaseline = "alphabetic"; this._font = "10px sans-serif"; this.dash = [];
  }
  X(x) { return n2(x * MM); }
  Y(y) { return n2((this.h - y) * MM); }
  scale() {}                                         // ya trabajamos en mm
  set font(f) { this._font = f; measureCtx.font = f; }
  get font() { return this._font; }
  measureText(t) { measureCtx.font = this._font; return measureCtx.measureText(t); }
  setLineDash(a) { this.dash = a; }
  fillRect(x, y, w, h) {
    this.ops.push(`${pdfColor(this.fillStyle)} rg ${this.X(x)} ${this.Y(y + h)} ${n2(w * MM)} ${n2(h * MM)} re f`);
  }
  beginPath() { this.path = []; }
  moveTo(x, y) { this.path.push(`${this.X(x)} ${this.Y(y)} m`); this.cur = [x, y]; }
  lineTo(x, y) { this.path.push(`${this.X(x)} ${this.Y(y)} l`); this.cur = [x, y]; }
  // esquina redondeada (como canvas.arcTo) con una curva Bézier
  arcTo(x1, y1, x2, y2, r) {
    const [x0, y0] = this.cur;
    const u = (ax, ay, bx, by) => { const d = Math.hypot(bx - ax, by - ay) || 1; return [(bx - ax) / d, (by - ay) / d]; };
    const [ux0, uy0] = u(x1, y1, x0, y0), [ux2, uy2] = u(x1, y1, x2, y2);
    const t1 = [x1 + ux0 * r, y1 + uy0 * r], t2 = [x1 + ux2 * r, y1 + uy2 * r], K = 0.5523;
    this.lineTo(t1[0], t1[1]);
    const c1 = [t1[0] + (x1 - t1[0]) * K, t1[1] + (y1 - t1[1]) * K], c2 = [t2[0] + (x1 - t2[0]) * K, t2[1] + (y1 - t2[1]) * K];
    this.path.push(`${this.X(c1[0])} ${this.Y(c1[1])} ${this.X(c2[0])} ${this.Y(c2[1])} ${this.X(t2[0])} ${this.Y(t2[1])} c`);
    this.cur = t2;
  }
  closePath() { this.path.push("h"); }
  stroke() {
    const d = this.dash.length ? `[${this.dash.map(v => n2(v * MM)).join(" ")}] 0 d` : "[] 0 d";
    this.ops.push(`${pdfColor(this.strokeStyle)} RG ${n2(this.lineWidth * MM)} w ${d}\n${this.path.join("\n")}\nS`);
  }
  fillText(txt, x, y) {
    // se guarda y luego se convierte en imagen nítida
    const m = this.measureText(txt), size = parseFloat(this._font.match(/([\d.]+)px/)[1]);
    const w = m.width, x0 = this.textAlign === "center" ? x - w / 2 : this.textAlign === "right" ? x - w : x;
    const top = y - size * 0.95, h = size * 1.25, pad = 0.3;
    const id = "T" + this.texts.length;
    this.texts.push({ id, txt, font: this._font, color: this.fillStyle, x0: x0 - pad, top: top - pad, w: w + 2 * pad, h: h + 2 * pad, baseY: y - top + pad, left: pad });
    this.ops.push(`q ${n2((w + 2 * pad) * MM)} 0 0 ${n2((h + 2 * pad) * MM)} ${this.X(x0 - pad)} ${this.Y(top - pad + h + 2 * pad)} cm /${id} Do Q`);
  }
}

async function deflate(bytes) {
  const s = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

// Convierte un texto en imagen RGB + máscara de transparencia
async function textImage(t) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(t.w * TEXT_RES)); c.height = Math.max(1, Math.ceil(t.h * TEXT_RES));
  const g = c.getContext("2d");
  g.scale(TEXT_RES, TEXT_RES);
  g.font = t.font; g.fillStyle = t.color; g.textBaseline = "alphabetic"; g.textAlign = "left";
  g.fillText(t.txt, t.left, t.baseY);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const rgb = new Uint8Array(c.width * c.height * 3), a = new Uint8Array(c.width * c.height);
  const [r, gg, b] = [1, 3, 5].map(i => parseInt(t.color.slice(i, i + 2), 16));
  for (let i = 0, j = 0, k = 0; i < d.length; i += 4) { rgb[j++] = r; rgb[j++] = gg; rgb[j++] = b; a[k++] = d[i + 3]; }
  return { w: c.width, h: c.height, rgb: await deflate(rgb), alpha: await deflate(a) };
}

// Dibuja una hoja en el lienzo PDF y devuelve sus instrucciones + textos
function vectorPage(drawFn, o) {
  const P = pageSize();
  const pc = new PdfCanvas(P.wMm, P.hMm);
  drawFn(pc, P.wMm, P.hMm, o);
  return pc;
}

// Arma el archivo PDF completo
async function buildVectorPdf(wMm, hMm, templates, pages) {
  // templates: { nombre: PdfCanvas } · pages: [{ tpl: nombre, number: texto o null }]
  const enc = new TextEncoder(), parts = [], offsets = [];
  let length = 0;
  const push = x => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); length += b.length; };
  const objs = [];
  const add = chunks => { objs.push(chunks); return objs.length; };
  const stream = async (str, extra = "") => {
    const z = await deflate(enc.encode(str));
    return add([`<< /Length ${z.length} /Filter /FlateDecode ${extra}>>\nstream\n`, z, "\nendstream"]);
  };

  const catalog = add(null), pagesObj = add(null);
  const font = add(["<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]);
  const W = n2(wMm * MM), H = n2(hMm * MM);

  // cada plantilla: su contenido vectorial (una sola vez) + sus textos como imágenes
  const tplInfo = {};
  for (const [name, pc] of Object.entries(templates)) {
    const xobj = [];
    for (const t of pc.texts) {
      const im = await textImage(t);
      const mask = add([`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${im.alpha.length} >>\nstream\n`, im.alpha, "\nendstream"]);
      const img = add([`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /SMask ${mask} 0 R /Length ${im.rgb.length} >>\nstream\n`, im.rgb, "\nendstream"]);
      xobj.push(`/${t.id} ${img} 0 R`);
    }
    const content = await stream("1 J 1 j\n" + pc.ops.join("\n") + "\n");
    tplInfo[name] = { content, res: `<< /XObject << ${xobj.join(" ")} >> /Font << /F1 ${font} 0 R >> >>` };
  }

  const textCol = pdfColor(THEMES[state.theme].text);
  const kids = [];
  for (const pg of pages) {
    const info = tplInfo[pg.tpl];
    let contents = `${info.content} 0 R`;
    if (pg.number) {
      const np = new PdfCanvas(wMm, hMm);
      drawText(np, pg.number, wMm - 7, hMm - 3.5, THEMES[state.theme].text, 7, false, "right");
      // número dibujado como vector + el mismo número como texto invisible (para buscar y copiar)
      const tw = pg.number.length * 0.556 * 7;
      const c = np.ops.join("\n") + `\nBT /F1 7 Tf 3 Tr ${n2(wMm * MM - 7 * MM - tw)} ${n2(3.5 * MM)} Td (${pg.number}) Tj ET\n`;
      const num = await stream(c);
      contents = `[${info.content} 0 R ${num} 0 R]`;
    }
    kids.push(add([`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${W} ${H}] /Resources ${info.res} /Contents ${contents} >>`]));
  }
  objs[catalog - 1] = [`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`];
  objs[pagesObj - 1] = [`<< /Type /Pages /Kids [${kids.map(i => i + " 0 R").join(" ")}] /Count ${kids.length} >>`];

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  objs.forEach((chunks, i) => { offsets.push(length); push(`${i + 1} 0 obj\n`); chunks.forEach(push); push("\nendobj\n"); });
  const xref = length;
  push(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`);
  offsets.forEach(o => push(String(o).padStart(10, "0") + " 00000 n \n"));
  push(`trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: "application/pdf" });
}

async function makePdf() {
  msg(T().making);
  const o = options(), P = pageSize();
  const templates = {}, pages = [];
  let n = 0;
  if (o.cover && state.coverMode === "inside") { templates.cover = vectorPage(drawCover, o); pages.push({ tpl: "cover", number: null }); n++; }
  if (o.index) { templates.index = vectorPage(drawContents, o); pages.push({ tpl: "index", number: null }); n++; }
  templates.page = vectorPage(drawPage, o);              // una sola hoja que se repite
  // primer número: el que escribió la persona (para continuar un cuaderno) o, si está vacío, el que sigue a portada/índice
  const first = o.startNum || n + 1;
  for (let i = 0; i < o.pages; i++) pages.push({ tpl: "page", number: String(first + i) });
  await save(fileName("pdf"), await buildVectorPdf(P.wMm, P.hMm, templates, pages));
}

// Portada aparte: en PDF (vectorial, se importa como página en Samsung Notes) o como imagen
function coverName(ext = "png") { return fileName("png").replace(/\.png$/, "") + "_Cover." + ext; }
async function makeCoverPdf() {
  msg(T().making);
  const P = pageSize();
  const templates = { cover: vectorPage(drawCover, options()) };
  await save(coverName("pdf"), await buildVectorPdf(P.wMm, P.hMm, templates, [{ tpl: "cover", number: null }]));
}
async function makeCoverPng() {
  const c = render(drawCover, options());
  c.toBlob(b => save(coverName(), b), "image/png");
}

async function makePng() {
  const c = render(drawPage, options());
  c.toBlob(b => save(fileName("png"), b), "image/png");
}

// ---------------------------------------------------------------
