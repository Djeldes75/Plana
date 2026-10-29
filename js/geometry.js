// MEDIDAS
// Tamaño real de la hoja en mm y píxeles, y las opciones elegidas.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// 2. MEDIDAS: tamaño de la hoja en mm y en píxeles
// ---------------------------------------------------------------
function pageSize() {
  const d = DEVICES.find(x => x.id === state.device);
  let wMm, hMm, wPx, hPx;
  if (d.mm) {                       // papel: lo dibujamos a 200 píxeles por pulgada
    [wMm, hMm] = d.mm;
    wPx = Math.round(wMm / 25.4 * 200); hPx = Math.round(hMm / 25.4 * 200);
  } else {                          // tablet: píxeles reales de la pantalla
    [wPx, hPx] = d.px;
    const ppi = Math.hypot(wPx, hPx) / d.inch;   // píxeles por pulgada
    wMm = wPx / ppi * 25.4; hMm = hPx / ppi * 25.4;
  }
  if (state.orient === "landscape") { [wMm, hMm] = [hMm, wMm]; [wPx, hPx] = [hPx, wPx]; }
  return { wMm, hMm, wPx, hPx };
}

function options() {
  const v = id => document.getElementById(id);
  return {
    spacing: parseFloat(v("spacing").value),
    header: v("header").checked,
    subject: v("subject").value.trim(),
    margin: v("margin").checked,
    cover: v("cover").checked,
    index: v("index").checked,
    pages: Math.max(1, Math.min(100, parseInt(v("pages").value) || 1)),
    startNum: Math.max(0, Math.min(9999, parseInt(v("startNum").value) || 0)),   // 0 = automático
    coverTitle: v("coverTitle").value.trim(),
    coverSub: v("coverSub").value.trim(),
    coverName: v("coverName").checked,
    coverYear: v("coverYear").checked,
    coverNameText: v("coverNameText").value.trim(),
    coverYearText: v("coverYearText").value.trim() || String(new Date().getFullYear()),
  };
}

// ---------------------------------------------------------------
// 3. DIBUJO: todas las medidas en milímetros.
//    "ctx.scale" convierte milímetros a píxeles automáticamente.
// ---------------------------------------------------------------
const PT = 0.3528;  // 1 punto tipográfico en mm

// ---------------------------------------------------------------
