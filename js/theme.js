// TEMA DE LA APP (claro / oscuro)
// Se carga en <head> para que la app abra directo con el tema correcto, sin parpadeo.
// Si nunca elegiste, sigue el modo de la tablet o la PC; si elegiste, lo recuerda.
(function () {
  let t = null;
  try { t = localStorage.getItem("uiTheme"); } catch (e) { /* sin almacenamiento: no pasa nada */ }
  if (t !== "dark" && t !== "light") t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = t;
})();
