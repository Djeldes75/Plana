// ARRANQUE
// Construye botones, idioma de la app, eventos y el modo sin internet.
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// 6. ARRANQUE: botones, idioma de la app y cambios
// ---------------------------------------------------------------
function chips(id, items, key, small) {
  const box = document.getElementById(id);
  box.innerHTML = "";
  items.forEach(([value, text, dot]) => {
    const b = document.createElement("button");
    b.className = "chip" + (small ? " small" : "") + (state[key] === value ? " on" : "");
    if (dot) { const s = document.createElement("span"); s.className = "themeSw"; s.style.background = dot; b.appendChild(s); }
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
applyUI();

// Permiso de descargas dentro de Claude (si no existe, usamos la descarga normal)
if (window.claude && window.claude.use) {
  window.claude.use("downloads").then(d => { downloads = d; }).catch(() => {});
}

// App instalable: registra el service worker (solo en https y fuera de marcos, p. ej. GitHub Pages)
if ("serviceWorker" in navigator && location.protocol === "https:" && window.top === window) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
