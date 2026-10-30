// DATOS
// Tablets, tipos de hoja, colores e idiomas (de la plantilla y de la app).
// Este archivo se carga con <script src> en index.html (ver el orden allí).

// ---------------------------------------------------------------
// 1. DATOS
// ---------------------------------------------------------------
// Pantallas: [ancho, alto] en píxeles y diagonal en pulgadas.
// La serie S11 no tiene modelo "+", y la S12 solo tiene "+" y Ultra.
const ULTRA = [1848, 2960], PLUS = [1752, 2800], BASE = [1600, 2560];
const DEVICES = [
  { group: "Galaxy Tab S12 (2026)", id: "s12ultra", name: "Tab S12 Ultra · 14.6\"", px: ULTRA, inch: 14.6 },
  { group: "Galaxy Tab S12 (2026)", id: "s12plus",  name: "Tab S12+ · 12.6\"",      px: PLUS,  inch: 12.6 },
  { group: "Galaxy Tab S11 (2025)", id: "s11ultra", name: "Tab S11 Ultra · 14.6\"", px: ULTRA, inch: 14.6 },
  { group: "Galaxy Tab S11 (2025)", id: "s11",      name: "Tab S11 · 11\"",         px: BASE,  inch: 11 },
  { group: "Galaxy Tab S10 (2024)", id: "s10ultra", name: "Tab S10 Ultra · 14.6\"", px: ULTRA, inch: 14.6 },
  { group: "Galaxy Tab S10 (2024)", id: "s10plus",  name: "Tab S10+ · 12.4\"",      px: PLUS,  inch: 12.4 },
  { group: "Galaxy Tab S9 (2023)",  id: "s9ultra",  name: "Tab S9 Ultra · 14.6\"",  px: ULTRA, inch: 14.6 },
  { group: "Galaxy Tab S9 (2023)",  id: "s9plus",   name: "Tab S9+ · 12.4\"",       px: PLUS,  inch: 12.4 },
  { group: "Galaxy Tab S9 (2023)",  id: "s9",       name: "Tab S9 · 11\"",          px: BASE,  inch: 11 },
  { group: "A4",                    id: "a4",       name: "A4 · 21 × 29.7 cm",       mm: [210, 297] },
];

// Tipos de hoja. "file" es el nombre corto en inglés para el archivo.
const STYLES = ["lined", "grid", "dotted", "cornell", "language", "blank"];
const STYLE_FILE = { lined: "Lined", grid: "Grid", dotted: "Dotted", cornell: "Cornell", language: "Language", blank: "Blank" };

// Colores del papel
const THEMES = {
  light: { paper:"#FDFDFB", line:"#BAC3CD", grid:"#DCE1E7", dot:"#A9B3BE", red:"#E1868E", text:"#7D8792", ink:"#2E3640", panel:"#FBF6E6" },
  sepia: { paper:"#F3EAD7", line:"#CDBE9F", grid:"#E2D6BC", dot:"#B7A483", red:"#C67B6C", text:"#8B7B60", ink:"#3D3324", panel:"#EADDBF" },
  gray:  { paper:"#E4E6E9", line:"#B3BAC3", grid:"#CDD2D8", dot:"#9AA3AD", red:"#D27D86", text:"#6E7781", ink:"#2B3036", panel:"#D9DCE0" },
  dark:  { paper:"#16181C", line:"#3A424C", grid:"#2A3038", dot:"#4A535E", red:"#9B5560", text:"#7F8994", ink:"#E6E9ED", panel:"#221F17" },
};
const THEME_FILE = { light: "", sepia: "Sepia", gray: "Gray", dark: "Dark" };

const ACCENTS = ["#8E99A6", "#C79A1E", "#4F7CAC", "#3E9A86", "#8A6BB8", "#D2697A"];

// Textos impresos EN LA HOJA (idioma de la plantilla)
const LANGS = {
  en: { name: "English", topic: "TOPIC", date: "DATE", key: "KEY IDEAS", key2: "& QUESTIONS", notes: "NOTES",
        summary: "SUMMARY — in my own words", words: "NEW WORDS", word: "Word", meaning: "Translation", dph: { d: "DD", m: "MM", y: "YYYY" },
        phrases: "PHRASES TO PRACTISE", contents: "Contents", page: "PAGE", yourName: "Name", notebook: "Notebook" },
  es: { name: "Español", topic: "TEMA", date: "FECHA", key: "IDEAS CLAVE", key2: "Y PREGUNTAS", notes: "APUNTES",
        summary: "RESUMEN — con mis palabras", words: "PALABRAS NUEVAS", word: "Palabra", meaning: "Traducción", dph: { d: "DD", m: "MM", y: "AAAA" },
        phrases: "FRASES PARA PRACTICAR", contents: "Índice", page: "PÁG.", yourName: "Nombre", notebook: "Cuaderno" },
  lt: { name: "Lietuvių", topic: "TEMA", date: "DATA", key: "PAGRINDINĖS MINTYS", key2: "IR KLAUSIMAI", notes: "UŽRAŠAI",
        summary: "SANTRAUKA — savais žodžiais", words: "NAUJI ŽODŽIAI", word: "Žodis", meaning: "Vertimas", dph: { d: "DD", m: "MM", y: "YYYY" },
        phrases: "FRAZĖS PRAKTIKAI", contents: "Turinys", page: "PSL.", yourName: "Vardas", notebook: "Sąsiuvinis" },
};

// Textos DE LA APP (idioma de la interfaz)
const UI = {
  es: {
    title: "Plana", subtitle: "Crea cuadernos para tu tablet. Elige, mira la vista previa y descarga.",
    s_tablet: "Tu tablet", dev: "Hoja de {w} × {h} cm · {pw} × {ph} píxeles",
    s_orient: "Posición de la tablet", portrait: "Vertical", landscape: "Horizontal",
    s_style: "Tipo de hoja",
    st: { lined: "Rayada", grid: "Cuadros", dotted: "Puntos", cornell: "Cornell", language: "Idiomas", blank: "En blanco" },
    si: { lined: "Líneas horizontales, como un cuaderno normal. Para apuntes de cualquier materia.",
          grid: "Cuadritos de 5 mm. Para matemáticas, tablas, diagramas y dibujos técnicos.",
          dotted: "Puntitos en vez de líneas: guían sin estorbar. Para esquemas, mapas mentales o letra libre.",
          cornell: "Hoja en 3 partes: ideas clave a la izquierda, apuntes a la derecha y resumen abajo. Un método para estudiar mejor.",
          language: "Apuntes a la izquierda, columna de palabras nuevas a la derecha y frases para practicar abajo.",
          blank: "Sin líneas. Para dibujar o escribir libre." },
    s_tlang: "Idioma de la plantilla",
    s_spacing: "Espacio entre líneas", h_spacing: "8 mm es cómodo para escribir con el S Pen.", h_spacing_fixed: "Cuadros y puntos usan siempre 5 mm.",
    s_paper: "Color del papel", th: { light: "Blanco", sepia: "Sepia", gray: "Gris", dark: "Oscuro" },
    h_paper: "Sepia parece papel de libro; gris y oscuro cansan menos la vista de noche. En oscuro, usa el lápiz en blanco.",
    s_accent: "Color de los detalles", h_accent: "Recuadro de arriba, títulos y portada. El círculo de colores te deja elegir cualquier color.",
    s_extras: "Extras", o_header: "Recuadro arriba para escribir tema y fecha", ph_subject: "Nombre de la materia (opcional)",
    o_margin: "Línea roja de margen a la izquierda", o_cover: "Portada al inicio", o_index: "Página de índice al inicio",
    s_pages: "Número de hojas para escribir",
    s_fname: "Nombre del archivo", h_fname: "Puedes cambiarlo. Bórralo para volver al nombre automático.",
    b_pdf: "Descargar cuaderno (PDF)", b_reset: "↺ Volver a las opciones de fábrica", h_pdf: "Lo normal. En Samsung Notes: ⋮ → Importar PDF.",
    b_png: "Una hoja (PNG)", h_png: "Experimento: Samsung Notes podría usar esta imagen como fondo de todas las hojas nuevas.",
    tabCover: "Portada", tabIndex: "Índice", tabPage: "Hoja",
    cap: "{n} hojas para escribir", capCover: " + portada", capIndex: " + índice",
    c_editing: "Estás editando la portada", c_back: "← Volver a la hoja", c_design: "Diseño de la portada",
    cd: { band: "Banda", frame: "Marco", block: "Bloque", minimal: "Mínimo" },
    ci: { band: "Una franja de color con el título debajo.", frame: "Un marco de color alrededor, con el título al centro.",
          block: "La mitad de arriba de color, con el título encima.", minimal: "Solo el título al centro, con líneas finas." },
    c_title: "Título", c_sub: "Subtítulo (opcional)", ph_csub: "Ej.: Vilnius Tech · Otoño 2026",
    c_name: "Línea para escribir tu nombre", c_year: "Año en la esquina",
    c_shared: "El tamaño, el color del papel y el color de los detalles son los mismos de las hojas. Se cambian en «Volver a la hoja».",
    h_orient: "Nota: en Samsung Notes, el estilo de nota predeterminado debe estar en la misma posición.",
    ph_cname: "Tu nombre (opcional)",
    h_cyear: "Pon el año o el curso, por ejemplo 2026–2027. Vacío = el año actual. Queda fijo en el PDF que descargas.",
    c_where: "¿Dónde va la portada?", cw_sep: "Archivo aparte", cw_in: "Dentro del cuaderno",
    cwi_sep: "El PDF trae solo las hojas. La portada se descarga sola como imagen, con el botón de abajo.",
    cwi_in: "La portada va como primera página del PDF.",
    b_cover: "Descargar portada (imagen PNG)", capCoverSep: " (portada aparte)",
    s_start: "Empezar a numerar en",
    h_start: "Para continuar un cuaderno: pon el número que sigue (ej. 61) y desmarca portada e índice.",
    making: "Creando el PDF…", done: "Listo: ", declined: "Descarga cancelada.", fail: "No se pudo descargar aquí.",
  },
  en: {
    title: "Plana", subtitle: "Make notebooks for your tablet. Choose, check the preview and download.",
    s_tablet: "Your tablet", dev: "Page {w} × {h} cm · {pw} × {ph} pixels",
    s_orient: "Tablet orientation", portrait: "Portrait", landscape: "Landscape",
    s_style: "Page type",
    st: { lined: "Lined", grid: "Grid", dotted: "Dotted", cornell: "Cornell", language: "Language", blank: "Blank" },
    si: { lined: "Horizontal lines, like a regular notebook. For notes in any subject.",
          grid: "5 mm squares. For maths, tables, diagrams and technical drawings.",
          dotted: "Dots instead of lines: they guide without getting in the way. For sketches, mind maps or free writing.",
          cornell: "A page in 3 parts: key ideas on the left, notes on the right and a summary at the bottom. A method to study better.",
          language: "Notes on the left, a new-words column on the right and phrases to practise at the bottom.",
          blank: "No lines. For drawing or free writing." },
    s_tlang: "Template language",
    s_spacing: "Line spacing", h_spacing: "8 mm is comfortable for writing with the S Pen.", h_spacing_fixed: "Grid and dotted pages always use 5 mm.",
    s_paper: "Paper color", th: { light: "White", sepia: "Sepia", gray: "Gray", dark: "Dark" },
    h_paper: "Sepia looks like book paper; gray and dark are easier on the eyes at night. On dark, use a white pen.",
    s_accent: "Accent color", h_accent: "Top box, titles and cover. The rainbow circle lets you pick any color.",
    s_extras: "Extras", o_header: "Box at the top for topic and date", ph_subject: "Subject name (optional)",
    o_margin: "Red margin line on the left", o_cover: "Cover page at the start", o_index: "Contents page at the start",
    s_pages: "Number of writing pages",
    s_fname: "File name", h_fname: "You can change it. Clear it to go back to the automatic name.",
    b_pdf: "Download notebook (PDF)", b_reset: "↺ Reset to default options", h_pdf: "The usual option. In Samsung Notes: ⋮ → Import PDF.",
    b_png: "One page (PNG)", h_png: "Experiment: Samsung Notes might use this image as the background for every new page.",
    tabCover: "Cover", tabIndex: "Contents", tabPage: "Page",
    cap: "{n} writing pages", capCover: " + cover", capIndex: " + contents",
    c_editing: "You're editing the cover", c_back: "← Back to page", c_design: "Cover design",
    cd: { band: "Band", frame: "Frame", block: "Block", minimal: "Minimal" },
    ci: { band: "A color stripe with the title below.", frame: "A color frame around the page, title in the middle.",
          block: "Top half in color, with the title on it.", minimal: "Just the title in the middle, with thin lines." },
    c_title: "Title", c_sub: "Subtitle (optional)", ph_csub: "e.g. Vilnius Tech · Fall 2026",
    c_name: "Line to write your name", c_year: "Year in the corner",
    c_shared: "Size, paper color and accent color are shared with the pages. Change them in “Back to page”.",
    h_orient: "Note: in Samsung Notes, the default note style must be in the same orientation.",
    ph_cname: "Your name (optional)",
    h_cyear: "Type the year or school year, e.g. 2026–2027. Empty = this year. It stays fixed in the PDF you download.",
    c_where: "Where does the cover go?", cw_sep: "Separate file", cw_in: "Inside the notebook",
    cwi_sep: "The PDF has only the pages. Download the cover on its own as an image with the button below.",
    cwi_in: "The cover is the first page of the PDF.",
    b_cover: "Download cover (PNG image)", capCoverSep: " (separate cover)",
    s_start: "Start numbering at",
    h_start: "To continue a notebook: type the next number (e.g. 61) and untick cover and contents.",
    making: "Creating the PDF…", done: "Done: ", declined: "Download cancelled.", fail: "Download isn't available here.",
  },
  lt: {
    title: "Plana", subtitle: "Kurkite sąsiuvinius savo planšetei. Pasirinkite, peržiūrėkite ir atsisiųskite.",
    s_tablet: "Jūsų planšetė", dev: "Lapas {w} × {h} cm · {pw} × {ph} pikselių",
    s_orient: "Planšetės padėtis", portrait: "Vertikali", landscape: "Horizontali",
    s_style: "Lapo tipas",
    st: { lined: "Liniuotas", grid: "Langeliai", dotted: "Taškeliai", cornell: "Cornell", language: "Kalboms", blank: "Tuščias" },
    si: { lined: "Horizontalios linijos, kaip įprastame sąsiuvinyje. Bet kokio dalyko užrašams.",
          grid: "5 mm langeliai. Matematikai, lentelėms, schemoms ir techniniams brėžiniams.",
          dotted: "Taškeliai vietoj linijų: padeda, bet netrukdo. Schemoms, minčių žemėlapiams ar laisvam rašymui.",
          cornell: "Lapas iš 3 dalių: pagrindinės mintys kairėje, užrašai dešinėje, santrauka apačioje. Metodas geriau mokytis.",
          language: "Užrašai kairėje, naujų žodžių stulpelis dešinėje ir frazės praktikai apačioje.",
          blank: "Be linijų. Piešimui arba laisvam rašymui." },
    s_tlang: "Šablono kalba",
    s_spacing: "Tarpas tarp linijų", h_spacing: "8 mm patogu rašyti su S Pen.", h_spacing_fixed: "Langeliuose ir taškeliuose visada 5 mm.",
    s_paper: "Popieriaus spalva", th: { light: "Balta", sepia: "Sepija", gray: "Pilka", dark: "Tamsi" },
    h_paper: "Sepija primena knygos popierių; pilka ir tamsi mažiau vargina akis vakare. Tamsiame lape rašykite baltu rašikliu.",
    s_accent: "Detalių spalva", h_accent: "Viršutinis rėmelis, pavadinimai ir viršelis. Spalvotas apskritimas leidžia pasirinkti bet kokią spalvą.",
    s_extras: "Papildomai", o_header: "Rėmelis viršuje temai ir datai", ph_subject: "Dalyko pavadinimas (nebūtina)",
    o_margin: "Raudona paraštės linija kairėje", o_cover: "Viršelis pradžioje", o_index: "Turinio puslapis pradžioje",
    s_pages: "Rašymo lapų skaičius",
    s_fname: "Failo pavadinimas", h_fname: "Galite pakeisti. Ištrynus grįžta automatinis pavadinimas.",
    b_pdf: "Atsisiųsti sąsiuvinį (PDF)", b_reset: "↺ Atkurti numatytuosius nustatymus", h_pdf: "Įprastas būdas. Samsung Notes: ⋮ → Importuoti PDF.",
    b_png: "Vienas lapas (PNG)", h_png: "Bandymas: Samsung Notes gali naudoti šį paveikslėlį kaip visų naujų lapų foną.",
    tabCover: "Viršelis", tabIndex: "Turinys", tabPage: "Lapas",
    cap: "{n} rašymo lapų", capCover: " + viršelis", capIndex: " + turinys",
    c_editing: "Redaguojate viršelį", c_back: "← Grįžti į lapą", c_design: "Viršelio dizainas",
    cd: { band: "Juosta", frame: "Rėmelis", block: "Blokas", minimal: "Minimalus" },
    ci: { band: "Spalvota juosta, po ja pavadinimas.", frame: "Spalvotas rėmelis aplink, pavadinimas centre.",
          block: "Viršutinė pusė spalvota, ant jos pavadinimas.", minimal: "Tik pavadinimas centre su plonomis linijomis." },
    c_title: "Pavadinimas", c_sub: "Paantraštė (nebūtina)", ph_csub: "Pvz.: Vilnius Tech · 2026 ruduo",
    c_name: "Linija vardui įrašyti", c_year: "Metai kampe",
    c_shared: "Dydis, popieriaus ir detalių spalvos tokios pat kaip lapų. Jas pakeisite paspaudę „Grįžti į lapą“.",
    h_orient: "Pastaba: Samsung Notes numatytasis užrašų stilius turi būti tos pačios padėties.",
    ph_cname: "Jūsų vardas (nebūtina)",
    h_cyear: "Įrašykite metus ar mokslo metus, pvz. 2026–2027. Tuščia = šie metai. PDF faile jie lieka nepakitę.",
    c_where: "Kur dėti viršelį?", cw_sep: "Atskiras failas", cw_in: "Sąsiuvinio viduje",
    cwi_sep: "PDF faile tik lapai. Viršelį atsisiųskite atskirai kaip paveikslėlį žemiau esančiu mygtuku.",
    cwi_in: "Viršelis yra pirmasis PDF puslapis.",
    b_cover: "Atsisiųsti viršelį (PNG)", capCoverSep: " (viršelis atskirai)",
    s_start: "Pradėti numeruoti nuo",
    h_start: "Norėdami tęsti sąsiuvinį: įrašykite kitą numerį (pvz. 61) ir nuimkite viršelį bei turinį.",
    making: "Kuriamas PDF…", done: "Paruošta: ", declined: "Atsisiuntimas atšauktas.", fail: "Čia atsisiųsti nepavyko.",
  },
};

// Idioma inicial de la app: el del navegador si es español o lituano; si no, inglés
const nav = (navigator.language || "en").slice(0, 2);
const startLang = UI[nav] ? nav : "en";

// Lo que la persona ha elegido
const state = { device: "s10plus", style: "lined", theme: "light", accent: ACCENTS[1],
                lang: startLang, ui: startLang, orient: "portrait", previewPage: "page", fileEdited: false, coverDesign: "band", coverMode: "separate" };
// Formato de la fecha: el oficial de cada idioma (no se cambia)
// es: República Dominicana / España · en: Estados Unidos · lt: Lituania
const DATE_FORMAT = { es: "dmy", en: "mdy", lt: "ymd" };
const dateFmt = () => DATE_FORMAT[state.lang];
const L = () => LANGS[state.lang];
const T = () => UI[state.ui];

// ---------------------------------------------------------------
