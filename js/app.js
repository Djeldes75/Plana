// ARRANQUE
// Construye botones, idioma de la app, eventos y el modo sin internet.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// 6. ARRANQUE: botones, idioma de la app y cambios
// ---------------------------------------------------------------
// Dibujitos pequeños (SVG) para los botones de tipo de hoja y orientación
const ICONS = {
  lined:    '<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M6 8h12M6 12h12M6 16h12"/>',
  grid:     '<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M9 2v20M15 2v20M3 8.7h18M3 15.3h18"/>',
  dotted:   '<rect x="3" y="2" width="18" height="20" rx="2"/><g class="fill"><circle cx="8" cy="7.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="7.5" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="16.5" r="1"/><circle cx="12" cy="16.5" r="1"/><circle cx="16" cy="16.5" r="1"/></g>',
  blank:    '<rect x="3" y="2" width="18" height="20" rx="2"/>',
  cornell:  '<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M3 6h18M9 6v10M3 16h18"/>',
  language: '<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M3 6h18M12 6v9M3 15h18M6 18.5h12"/>',
  portrait: '<rect x="6" y="2" width="12" height="20" rx="2"/>',
  landscape:'<rect x="2" y="6" width="20" height="12" rx="2"/>',
};
function icon(name) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("class", "ico"); s.setAttribute("aria-hidden", "true");
  s.innerHTML = ICONS[name];
  return s;
}

function chips(id, items, key, small) {
  const box = document.getElementById(id);
  box.innerHTML = "";
  items.forEach(([value, text, dot]) => {
    const b = document.createElement("button");
    b.className = "chip" + (small ? " small" : "") + (state[key] === value ? " on" : "");
    if (dot) { const s = document.createElement("span"); s.className = "themeSw"; s.style.background = dot; b.appendChild(s); }
    if (ICONS[value] && (key === "style" || key === "orient")) b.appendChild(icon(value));
    b.appendChild(document.createTextNode(text));
    b.onclick = () => { state[key] = value; if (key === "ui") applyUI(); else { buildChips(); updatePreview(); } };
    box.appendChild(b);
  });
}

function accents() {
  const box = document.getElementById("accents"); box.innerHTML = "";
  ACCENTS.forEach(col => {
    const s = document.createElement("button");
    s.className = "sw" + (state.accent === col ? " on" : ""); s.style.background = col; s.title = col;
    s.onclick = () => { state.accent = col; accents(); updatePreview(); };
    box.appendChild(s);
  });
  // círculo de colores: cualquier color que quieras
  const custom = !ACCENTS.includes(state.accent);
  const p = document.createElement("label");
  p.className = "picker" + (custom ? " on" : "");
  if (custom) p.style.background = state.accent;
  const inp = document.createElement("input"); inp.type = "color"; inp.value = state.accent;
  inp.oninput = () => { state.accent = inp.value; p.style.background = inp.value; p.classList.add("on");
                        box.querySelectorAll(".sw").forEach(x => x.classList.remove("on")); updatePreview(); };
  p.appendChild(inp); box.appendChild(p);
}

function buildChips() {
  const t = T();
  chips("orient", [["portrait", t.portrait], ["landscape", t.landscape]], "orient");
  chips("styles", STYLES.map(s => [s, t.st[s]]), "style");
  chips("langs", Object.entries(LANGS).map(([k, v]) => [k, v.name]), "lang");
  chips("themes", Object.keys(THEMES).map(k => [k, t.th[k], THEMES[k].paper]), "theme");
}

function applyUI() {
  const t = T();
  document.documentElement.lang = state.ui;
  document.title = t.title;
  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t[el.dataset.t]; });
  document.getElementById("subject").placeholder = t.ph_subject;
  document.getElementById("coverSub").placeholder = t.ph_csub;
  document.getElementById("coverNameText").placeholder = t.ph_cname;
  chips("appLang", [["es", "ES"], ["en", "EN"], ["lt", "LT"]], "ui", true);
  buildChips();
  updatePreview();
}

const sel = document.getElementById("device");
const groups = {};
DEVICES.forEach(d => {
  if (!groups[d.group]) { groups[d.group] = document.createElement("optgroup"); groups[d.group].label = d.group; sel.appendChild(groups[d.group]); }
  const op = document.createElement("option"); op.value = d.id; op.textContent = d.name; groups[d.group].appendChild(op);
});
sel.value = state.device;
sel.onchange = () => { state.device = sel.value; updatePreview(); };

// Número de versión (abajo del idioma): sirve para saber si ya tienes la última
const APP_VERSION = "2.2.0";
document.getElementById("ver").textContent = "v" + APP_VERSION;

// Botón de tema: luna = pasar a oscuro, sol = pasar a claro
const themeBtn = document.getElementById("themeBtn");
function paintThemeBtn() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeBtn.textContent = dark ? "☀" : "☾";
  document.querySelector('meta[name="theme-color"]').content = dark ? "#151a21" : "#3E9A86";
}
themeBtn.onclick = () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("uiTheme", next); } catch (e) { /* sin almacenamiento */ }
  paintThemeBtn();
};
paintThemeBtn();

accents();
document.getElementById("backToPage").onclick = () => { state.previewPage = "page"; updatePreview(); window.scrollTo({ top: 0, behavior: "smooth" }); };
// al marcar "Portada", la mostramos de una vez para que se vean sus opciones
document.getElementById("cover").addEventListener("change", e => { if (e.target.checked) { state.previewPage = "cover"; updatePreview(); } });
["spacing", "header", "subject", "margin", "cover", "index", "pages", "startNum", "coverTitle", "coverSub", "coverName", "coverYear", "coverNameText", "coverYearText"].forEach(id =>
  document.getElementById(id).addEventListener("input", updatePreview));
// si la persona escribe su propio nombre de archivo, lo respetamos; si lo borra, vuelve el automático
document.getElementById("fname").addEventListener("input", e => { state.fileEdited = e.target.value.trim() !== ""; });
document.getElementById("fname").addEventListener("blur", () => { if (!state.fileEdited) updatePreview(); });
document.getElementById("dlPdf").onclick = makePdf;
document.getElementById("dlPng").onclick = makePng;
document.getElementById("dlCover").onclick = makeCoverPng;
window.addEventListener("resize", updatePreview);
// En vertical: tocar la hoja la agranda o la achica
document.getElementById("preview").onclick = () => {
  if (!window.matchMedia(STACKED).matches) return;
  bigPreview = !bigPreview;
  document.getElementById("previewArea").classList.toggle("big", bigPreview);
  updatePreview();
};
applyUI();

// Permiso de descargas dentro de Claude (si no existe, usamos la descarga normal)
if (window.claude && window.claude.use) {
  window.claude.use("downloads").then(d => { downloads = d; }).catch(() => {});
}

// App instalable: registra el service worker (solo en https y fuera de marcos, p. ej. GitHub Pages)
if ("serviceWorker" in navigator && location.protocol === "https:" && window.top === window) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
