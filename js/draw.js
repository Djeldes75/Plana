// DIBUJO
// Hojas, portadas e índice. Todas las medidas en milímetros.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

function hline(ctx, x0, x1, y) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); }
function vline(ctx, x, y0, y1) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
function label(ctx, txt, x, y, color, size = 6.5, bold = true, align = "left") {
  drawText(ctx, txt, x, y, color, size, bold, align);
}
// Dibuja renglones entre "top" y "bottom".
// head: espacio mínimo reservado arriba para un título (así ninguna línea lo cruza).
// GAP: la última línea nunca queda pegada al borde de abajo (ej. la línea del resumen).
const GAP = 2.5;
function ruled(ctx, T, x0, x1, top, bottom, step, head = 0) {
  ctx.strokeStyle = T.line; ctx.lineWidth = 0.5 * PT;
  for (let y = top + Math.max(step, head); y <= bottom - GAP; y += step) hline(ctx, x0, x1, y);
}
const BOX_TITLE = 6;   // franja solo para el título de la caja (Resumen / Frases)
const HEAD = 8.5;   // alto de la fila de títulos (Ideas clave, Palabras nuevas…)
// Coloca un separador (línea del resumen / de las frases) EXACTAMENTE sobre un renglón,
// para que todos los renglones de arriba midan lo mismo. "room" = espacio que necesita la caja de abajo.
function snapSeparator(top, bottom, step, room) {
  const first = top + Math.max(step, HEAD);
  const n = Math.max(1, Math.floor((bottom - room - first) / step));
  return first + n * step;
}
// Renglones de una caja de abajo (resumen / frases): el último cae justo en "bottom",
// y lo que sobra queda arriba, junto al título de la caja (no como un hueco al final).
function boxRows(ctx, T, x0, x1, bottom, step, n) {
  ctx.strokeStyle = T.line; ctx.lineWidth = 0.5 * PT;
  for (let i = 0; i < n; i++) hline(ctx, x0, x1, bottom - i * step);
}
// Calcula la zona de Cornell / Idiomas desde abajo: devuelve dónde va el separador (sep)
// y dónde empieza la zona de apuntes (top, con su fila de títulos).
function layoutFromBottom(TOP, BOTTOM, S, nBox) {
  const hd = Math.max(S, HEAD);
  // caja de abajo: franja del título (BOX_TITLE) + nBox renglones COMPLETOS para escribir
  // Se arma de ARRIBA hacia abajo: la zona de apuntes empieza pegada al recuadro de tema y fecha
  // (siempre a la misma distancia). Lo que sobra queda al final de la página, junto al número,
  // igual que en la hoja rayada.
  const top = TOP;
  const k = Math.max(1, Math.floor((BOTTOM - TOP - hd - BOX_TITLE - nBox * S) / S));  // renglones de arriba
  const sep = top + hd + k * S;                 // separador justo sobre un renglón
  const last = sep + BOX_TITLE + nBox * S;      // última línea de la caja de abajo (≤ BOTTOM)
  return { sep, top, last };
}
// Último renglón que cabe antes de "bottom" (para cortar márgenes y cuadrículas ahí)
function lastRow(top, bottom, step, head = 0) {
  const first = top + Math.max(step, head);
  return first + Math.floor((bottom - GAP - first) / step) * step;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// Una hoja de apuntes (sin número de página: ese lo pone el PDF)
function drawPage(ctx, W, H, o) {
  const T = THEMES[state.theme], A = state.accent, S = o.spacing;
  const MX = 15, BOTTOM = H - 9;
  const BOX_T = 6, BOX_B = 19;
  const TOP = o.header ? BOX_B + 3 : 8;

  ctx.fillStyle = T.paper; ctx.fillRect(0, 0, W, H);

  const st = state.style;
  if (st === "lined") {
    ruled(ctx, T, 0, W, TOP, BOTTOM, S);
  } else if (st === "grid") {
    const g = 5; ctx.strokeStyle = T.grid; ctx.lineWidth = 0.4 * PT;
    const gEnd = TOP + Math.floor((BOTTOM - TOP) / g) * g;          // última línea de la cuadrícula
    for (let y = TOP; y <= gEnd + 0.01; y += g) hline(ctx, 0, W, y);
    for (let x = o.margin ? MX : 0; x < W; x += g) vline(ctx, x, TOP, gEnd);
  } else if (st === "dotted") {
    const g = 5; ctx.fillStyle = T.dot;
    for (let y = TOP + g; y < BOTTOM; y += g)
      for (let x = (o.margin ? MX : 0) + g; x < W - 3; x += g) ctx.fillRect(x - 0.2, y - 0.2, 0.4, 0.4);
  } else if (st === "cornell" || st === "language") {
    // Se arma DE ABAJO HACIA ARRIBA para que todo cuadre:
    // la caja de abajo tiene siempre los mismos renglones y el último cae en el borde;
    // lo que sobra queda bajo el recuadro de tema y fecha.
    const L2 = layoutFromBottom(TOP, BOTTOM, S, st === "cornell" ? 4 : 3);
    const top = L2.top, sep = L2.sep;
    if (st === "cornell") {
      const cue = Math.min(46, W * 0.28);
      ruled(ctx, T, 0, W, top, sep - S + GAP + 0.01, S, HEAD);
      ctx.strokeStyle = T.red; ctx.lineWidth = 0.8 * PT; vline(ctx, cue, top, sep);
      label(ctx, L().key, 5, top + 3.4, T.text); label(ctx, L().key2, 5, top + 6.6, T.text);
      label(ctx, L().notes, cue + 4, top + 5, T.text);
      ctx.strokeStyle = A; hline(ctx, 0, W, sep);
      label(ctx, L().summary, o.margin ? MX + 3 : 6, sep + 4.4, A);
    } else {
      const vx = W - Math.min(62, W * 0.37);
      ruled(ctx, T, 0, vx, top, sep - S + GAP + 0.01, S, HEAD);
      ctx.fillStyle = T.panel; ctx.fillRect(vx, top, W - vx, sep - top);
      ruled(ctx, T, vx, W, top, sep - S + GAP + 0.01, S, HEAD);
      ctx.strokeStyle = A; ctx.lineWidth = 0.8 * PT; vline(ctx, vx, top, sep);
      const half = (W - vx) / 2;
      ctx.strokeStyle = T.line; ctx.setLineDash([1.5, 1.5]); vline(ctx, vx + half, top + Math.max(S, HEAD), sep); ctx.setLineDash([]);
      label(ctx, L().words, vx + 3, top + 3.6, A);
      label(ctx, L().word, vx + 3, top + 7, T.text, 6, false);
      label(ctx, L().meaning, vx + half + 3, top + 7, T.text, 6, false);
      ctx.strokeStyle = A; hline(ctx, 0, W, sep);
      label(ctx, L().phrases, o.margin ? MX + 3 : 6, sep + 4.4, A);
    }
    boxRows(ctx, T, 0, W, L2.last, S, st === "cornell" ? 4 : 3);
    // Cornell: el resumen también lleva margen rojo (como las demás hojas)
    if (st === "cornell" && o.margin) { ctx.strokeStyle = T.red; ctx.lineWidth = 0.8 * PT; vline(ctx, MX, sep, H); }
  }

  // margen rojo
  if (o.margin && st !== "cornell" && st !== "blank") {
    const LL = st === "language" ? layoutFromBottom(TOP, BOTTOM, S, 3) : null;
    const bottom = st === "language" ? H
                 : st === "grid" ? TOP + Math.floor((BOTTOM - TOP) / 5) * 5
                 : st === "dotted" ? TOP + Math.floor((BOTTOM - TOP) / 5) * 5
                 : lastRow(TOP, BOTTOM, S);
    ctx.strokeStyle = T.red; ctx.lineWidth = 0.8 * PT; vline(ctx, MX, LL ? LL.top : TOP, bottom);
  }

  // recuadro de tema y fecha
  if (o.header) {
    const left = 6, dx = W - 46;
    ctx.strokeStyle = A; ctx.lineWidth = 0.8 * PT;
    roundRect(ctx, left, BOX_T, W - left - 6, BOX_B - BOX_T, 2); ctx.stroke();
    vline(ctx, dx, BOX_T, BOX_B);
    label(ctx, L().topic, left + 3, BOX_T + 3.6, T.text, 6.5, false);
    label(ctx, L().date, dx + 3, BOX_T + 3.6, T.text, 6.5, false);
    // casillas de la fecha según el formato (día, mes, año) con letras guía muy suaves
    const ph = L().dph, fmt = dateFmt(), sep = fmt === "ymd" ? "-" : "/";
    const order = { dmy: ["d", "m", "y"], mdy: ["m", "d", "y"], ymd: ["y", "m", "d"] }[fmt];
    const widths = { d: 10, m: 10, y: 14 };
    let x = dx + 2;
    order.forEach((k, i) => {
      label(ctx, ph[k], x + widths[k] / 2, BOX_B - 1.6, T.text, 4.2, false, "center");
      x += widths[k];
      if (i < 2) { label(ctx, sep, x + 1, BOX_B - 3, T.text, 10, false, "center"); x += 2; }
    });
    if (o.subject) label(ctx, o.subject.toUpperCase(), dx - 3, BOX_T + 3.6, A, 6.5, true, "right");
  }
}

// ---- PORTADA: 4 diseños ----
// Parte el título en líneas que quepan en "maxW" (máximo 3)
function wrapLines(text, maxW, size) {
  const words = text.split(/\s+/), lines = []; let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (textWidth(test, size, true) > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
// Elige un tamaño de letra para que el título quepa en 2 líneas
function fitTitle(ctx, text, maxW, start = 28) {
  let size = start, lines;
  do { lines = wrapLines(text, maxW, size); size--; }
  while ((lines.length > 2 || lines.some(l => textWidth(l, size + 1, true) > maxW)) && size > 12);
  return { size: size + 1, lines };
}
// ¿Texto blanco o negro encima del color? (según lo claro que sea)
function onColor(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? "#222222" : "#FFFFFF";
}

function drawCover(ctx, W, H, o) {
  const T = THEMES[state.theme], A = state.accent, d = state.coverDesign;
  const title = o.coverTitle || o.subject || L().notebook;
  ctx.fillStyle = T.paper; ctx.fillRect(0, 0, W, H);
  let titleColor = T.ink, subColor = T.text, yearColor = A, nameY = H - 30, nameX0 = 12, nameX1 = W - 12;
  let tx, ty, align = "left", maxW = W - 24;

  if (d === "band") {
    const bandY = H * 0.38;
    ctx.fillStyle = A; ctx.fillRect(0, bandY - 9, W, 9);
    tx = 12; ty = bandY + 16;
  } else if (d === "frame") {
    const m = 10;
    ctx.strokeStyle = A; ctx.lineWidth = 1.4 * PT; roundRect(ctx, m, m, W - 2 * m, H - 2 * m, 3); ctx.stroke();
    ctx.lineWidth = 0.5 * PT; roundRect(ctx, m + 2.5, m + 2.5, W - 2 * m - 5, H - 2 * m - 5, 2); ctx.stroke();
    tx = W / 2; ty = H * 0.42; align = "center"; maxW = W - 2 * m - 24;
    nameY = H - m - 18; nameX0 = m + 12; nameX1 = W - m - 12;
  } else if (d === "block") {
    const by = H * 0.5;
    ctx.fillStyle = A; ctx.fillRect(0, 0, W, by);
    titleColor = onColor(A); yearColor = titleColor;
    tx = 12; ty = null;            // el título se apoya en el borde de abajo del bloque
  } else {                          // minimal
    tx = W / 2; ty = H * 0.46; align = "center";
  }

  const fit = fitTitle(ctx, title, maxW);
  const lh = fit.size * PT * 1.2;
  if (d === "block") ty = H * 0.5 - 12 - lh * (fit.lines.length - 1);
  fit.lines.forEach((ln, i) => label(ctx, ln, tx, ty + i * lh, titleColor, fit.size, true, align));
  let after = ty + (fit.lines.length - 1) * lh;

  if (d === "frame" || d === "minimal") {
    ctx.strokeStyle = A; ctx.lineWidth = 0.8 * PT;
    hline(ctx, W / 2 - 15, W / 2 + 15, after + 7);
    if (d === "minimal") hline(ctx, W / 2 - 15, W / 2 + 15, ty - fit.size * PT - 5);
    after += 7;
  }
  if (o.coverSub) {
    const sy = d === "block" ? H * 0.5 + 12 : after + 9;
    label(ctx, o.coverSub, d === "block" ? 12 : tx, sy, subColor, 10, false, align);
  }
  if (o.coverYear) label(ctx, o.coverYearText, W - (d === "frame" ? 22 : 12), d === "frame" ? 24 : 16, yearColor, 10, true, "right");
  if (o.coverName) {
    label(ctx, L().yourName, nameX0, nameY, T.text, 9, false);
    const lx = nameX0 + textWidth(L().yourName, 9, false) + 3;
    ctx.strokeStyle = T.line; ctx.lineWidth = 0.6 * PT; hline(ctx, lx, nameX1, nameY + 0.5);
    if (o.coverNameText) label(ctx, o.coverNameText, lx + 2, nameY - 0.6, T.ink, 12, false);
  }
}

function drawContents(ctx, W, H, o) {
  const T = THEMES[state.theme], A = state.accent;
  ctx.fillStyle = T.paper; ctx.fillRect(0, 0, W, H);
  label(ctx, L().contents, 10, 16, T.ink, 13);
  const top = 22;
  ctx.strokeStyle = A; ctx.lineWidth = 0.8 * PT; hline(ctx, 6, W - 6, top);
  label(ctx, L().date, 8, top + 5, T.text); label(ctx, L().topic, 30, top + 5, T.text); label(ctx, L().page, W - 18, top + 5, T.text);
  ruled(ctx, T, 6, W - 6, top, H - 9, o.spacing, HEAD);
  ctx.strokeStyle = T.line; vline(ctx, 27, top, H - 11); vline(ctx, W - 21, top, H - 11);
}

// Dibuja algo en un canvas. widthPx: solo para la vista previa (más pequeña)
function render(drawFn, o, widthPx) {
  const P = pageSize();
  const w = widthPx || P.wPx, scale = w / P.wMm;
  const c = document.createElement("canvas");
  c.width = Math.round(w); c.height = Math.round(P.hMm * scale);
  const ctx = c.getContext("2d");
  ctx.scale(scale, scale);
  drawFn(ctx, P.wMm, P.hMm, o);
  return c;
}

// ---------------------------------------------------------------
