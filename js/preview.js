// VISTA PREVIA
// Pestañas, panel de portada y textos que cambian con las opciones.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// 4. VISTA PREVIA
// ---------------------------------------------------------------
const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k]);

// Igual que en css/styles.css: vertical o pantalla angosta = hoja arriba y opciones abajo
const STACKED = "(orientation: portrait), (max-width: 999px)";
let bigPreview = false;

function updatePreview() {
  const o = options(), P = pageSize(), t = T();

  // pestañas: portada e índice solo aparecen si están marcados
  const tabs = [];
  if (o.cover) tabs.push(["cover", t.tabCover]);
  if (o.index) tabs.push(["index", t.tabIndex]);
  tabs.push(["page", t.tabPage]);
  if (!tabs.some(x => x[0] === state.previewPage)) state.previewPage = "page";
  chips("pvTabs", tabs, "previewPage", true);
  document.getElementById("pvTabs").hidden = tabs.length < 2;   // con una sola pestaña no hace falta mostrarla

  // en la pestaña Portada, el panel muestra solo las opciones de portada
  const onCover = state.previewPage === "cover";
  document.querySelectorAll(".step.pg").forEach(el => { el.hidden = onCover; });
  document.getElementById("coverControls").hidden = !onCover;
  document.getElementById("coverBar").hidden = !onCover;
  document.getElementById("fnameNum").textContent = onCover ? 6 : 10;
  chips("coverDesigns", ["band", "frame", "block", "minimal"].map(k => [k, t.cd[k]]), "coverDesign");
  document.getElementById("coverInfo").textContent = t.ci[state.coverDesign];
  chips("coverWhere", [["separate", t.cw_sep], ["inside", t.cw_in]], "coverMode");
  document.getElementById("coverWhereInfo").textContent = state.coverMode === "separate" ? t.cwi_sep : t.cwi_in;
  document.getElementById("coverTitle").placeholder = o.subject || L().notebook;
  document.getElementById("coverNameText").style.display = o.coverName ? "" : "none";
  document.getElementById("coverYearText").style.display = o.coverYear ? "" : "none";
  document.getElementById("coverYearText").nextElementSibling.style.display = o.coverYear ? "" : "none";
  document.getElementById("coverYearText").placeholder = String(new Date().getFullYear());

  const fn = { cover: drawCover, index: drawContents, page: drawPage }[state.previewPage];
  const pv = document.getElementById("preview");
  // Tamaño de la hoja: en horizontal ocupa el alto de la pantalla; en vertical arriba,
  // grande, y al tocarla se agranda todavía más.
  const stacked = window.matchMedia(STACKED).matches;
  const maxH = stacked ? window.innerHeight * (bigPreview ? 0.84 : 0.52) : window.innerHeight - 200;
  const maxW = Math.max(120, Math.min((pv.parentElement.clientWidth || 600) - 16, maxH * P.wMm / P.hMm));
  const dpr = window.devicePixelRatio || 1;
  const small = render(fn, o, maxW * dpr);
  pv.width = small.width; pv.height = small.height; pv.style.width = maxW + "px";
  pv.getContext("2d").drawImage(small, 0, 0);

  const fixed = ["grid", "dotted", "blank"].includes(state.style);
  document.getElementById("spacingVal").textContent = o.spacing;
  document.getElementById("spacingStep").style.opacity = fixed ? 0.45 : 1;
  document.getElementById("spacingHint").textContent = fixed ? t.h_spacing_fixed : t.h_spacing;
  document.getElementById("styleInfo").textContent = t.si[state.style];
  // Cornell ya trae su propia línea roja; la hoja en blanco no lleva margen
  document.getElementById("marginRow").style.display = state.style === "blank" ? "none" : "flex";
  document.getElementById("deviceInfo").textContent = fill(t.dev,
    { w: (P.wMm / 10).toFixed(1), h: (P.hMm / 10).toFixed(1), pw: P.wPx, ph: P.hPx });
  document.getElementById("cap").textContent =
    fill(t.cap, { n: o.pages }) + (o.cover ? (state.coverMode === "separate" ? t.capCoverSep : t.capCover) : "") + (o.index ? t.capIndex : "");

  document.getElementById("startNum").placeholder = String((o.cover && state.coverMode === "inside" ? 1 : 0) + (o.index ? 1 : 0) + 1);
  if (!state.fileEdited) document.getElementById("fname").value = autoName();
}

// ---------------------------------------------------------------
