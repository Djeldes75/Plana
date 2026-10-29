// TEXTOS VECTORIALES
// Dibuja textos con los contornos de Inter, en canvas y en PDF.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// TEXTOS VECTORIALES
// Las letras se dibujan con su contorno (fuente Inter, licencia libre OFL),
// igual en la vista previa, en el PNG y en el PDF: así se ven nítidas a
// cualquier zoom. Si alguien escribe un carácter que no está en la lista
// (por ejemplo un emoji), ese texto usa la fuente del sistema como respaldo.
// ---------------------------------------------------------------
const UPM = FONT.upm;
function parseGlyphs(set) {
  const out = {};
  for (const [ch, [adv, d]] of Object.entries(set)) {
    const cmds = [];
    d.replace(/([MLCZ])([^MLCZ]*)/g, (_, op, nums) => { cmds.push([op, ...nums.trim().split(/\s+/).filter(Boolean).map(Number)]); });
    out[ch] = { adv, cmds };
  }
  return out;
}
const GLYPHS = { r: parseGlyphs(FONT.r), b: parseGlyphs(FONT.b) };
const fallbackCtx = document.createElement("canvas").getContext("2d");
const fallbackFont = (size, bold) => `${bold ? "bold " : ""}${size * PT}px Helvetica, Arial, sans-serif`;
const canVector = txt => [...txt].every(ch => GLYPHS.r[ch]);

function textWidth(txt, size, bold) {
  if (!canVector(txt)) { fallbackCtx.font = fallbackFont(size, bold); return fallbackCtx.measureText(txt).width; }
  const set = bold ? GLYPHS.b : GLYPHS.r;
  let w = 0; for (const ch of txt) w += set[ch].adv;
  return w * size * PT / UPM;
}

function drawText(ctx, txt, x, y, color, size, bold, align) {
  const w = textWidth(txt, size, bold);
  const x0 = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  if (!canVector(txt)) {                                   // respaldo
    ctx.font = fallbackFont(size, bold); ctx.fillStyle = color; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillText(txt, x0, y); return;
  }
  const set = bold ? GLYPHS.b : GLYPHS.r, s = size * PT / UPM;
  const isPdf = typeof PdfCanvas !== "undefined" && ctx instanceof PdfCanvas;
  const out = [];
  let pen = x0;
  if (!isPdf) ctx.beginPath();
  for (const ch of txt) {
    const g = set[ch];
    const P = (gx, gy) => [pen + gx * s, y - gy * s];
    for (const c of g.cmds) {
      const op = c[0];
      if (op === "Z") { isPdf ? out.push("h") : ctx.closePath(); continue; }
      const pts = []; for (let i = 1; i < c.length; i += 2) pts.push(P(c[i], c[i + 1]));
      if (isPdf) {
        const t = pts.map(([px, py]) => `${ctx.X(px)} ${ctx.Y(py)}`).join(" ");
        out.push(t + (op === "M" ? " m" : op === "L" ? " l" : " c"));
      } else if (op === "M") ctx.moveTo(...pts[0]);
      else if (op === "L") ctx.lineTo(...pts[0]);
      else ctx.bezierCurveTo(...pts[0], ...pts[1], ...pts[2]);
    }
    pen += g.adv * s;
  }
  if (isPdf) ctx.ops.push(`${pdfColor(color)} rg\n${out.join("\n")}\nf`);
  else { ctx.fillStyle = color; ctx.fill(); }
}
