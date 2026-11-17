// Genera capturas ficticias (SVG) para los proyectos de ejemplo: public/ejemplo/<slug>-<n>.svg
// Uso: node scripts/generar-imagenes.mjs
import { mkdir, writeFile } from "node:fs/promises";

const W = 1200;
const H = 750;
const F = "Inter, Segoe UI, system-ui, sans-serif";
const MONO = "Consolas, Menlo, monospace";

const r = (x, y, w, h, fill, rx = 10, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const t = (x, y, s, size = 18, fill = "#1b1a17", weight = 400, anchor = "start", font = F) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;
const c = (x, y, rad, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${fill}" ${extra}/>`;
const lineas = (x, y, anchos, color = "#d9d4c7", alto = 12, gap = 24) => anchos.map((w, i) => r(x, y + i * gap, w, alto, color, alto / 2)).join("");

function fondo(p, contenido, titulo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/></linearGradient>
<filter id="s" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-opacity=".28"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<circle cx="1080" cy="80" r="220" fill="#fff" opacity=".08"/><circle cx="90" cy="700" r="260" fill="#000" opacity=".06"/>
${contenido}
<title>${titulo}</title></svg>`;
}

/** Ventana de navegador con barra de dirección. */
function ventana(p, url, cuerpo) {
  return `<g filter="url(#s)">${r(70, 50, 1060, 650, "#ffffff", 18)}</g>
${r(70, 50, 1060, 52, "#f1efe9", 18)}${r(70, 84, 1060, 18, "#f1efe9", 0)}
${c(100, 76, 7, "#ff5f57")}${c(124, 76, 7, "#febc2e")}${c(148, 76, 7, "#28c840")}
${r(380, 62, 440, 28, "#ffffff", 14)}${t(600, 81, url, 14, "#6b6558", 400, "middle")}
<g transform="translate(70 102)">${cuerpo}</g>`;
}

/** Teléfono centrado. */
function telefono(p, cuerpo) {
  return `<g filter="url(#s)">${r(455, 40, 290, 670, "#111", 44)}</g>${r(467, 52, 266, 646, "#fff", 34)}${r(560, 62, 80, 18, "#111", 9)}
<g transform="translate(467 90)">${cuerpo}</g>`;
}

const navBarra = (p, marca) => `${r(0, 0, 1060, 64, "#fff", 0)}${r(30, 18, 28, 28, p.a, 8)}${t(70, 39, marca, 18, "#1b1a17", 700)}
${t(640, 38, "Inicio", 15, "#6b6558")}${t(710, 38, "Proyectos", 15, "#6b6558")}${t(800, 38, "Contacto", 15, "#6b6558")}${r(890, 16, 130, 34, p.a, 17)}${t(955, 38, "Hablemos", 14, "#fff", 600, "middle")}
<line x1="0" y1="64" x2="1060" y2="64" stroke="#e8e4da"/>`;

// ---------- Contenidos por tipo ----------
const pantallas = {
  portafolio: (p) => [
    ventana(p, "portafolio.vercel.app", `${navBarra(p, "Juan José")}
${t(60, 140, "DESARROLLADOR WEB", 14, "#6b6558", 700)}${t(60, 200, "Hola, soy", 52, "#1b1a17", 700)}${t(330, 200, "Juan José", 52, p.a, 700)}
${lineas(60, 235, [460, 430, 380], "#e3ded2", 13, 26)}${r(60, 330, 150, 46, p.a, 23)}${t(135, 359, "Ver proyectos", 15, "#fff", 600, "middle")}${r(225, 330, 130, 46, "#fff", 23, `stroke="${p.a}" stroke-width="2"`)}${t(290, 359, "Escríbame", 15, p.a, 600, "middle")}
${c(820, 230, 140, p.suave)}${c(820, 230, 140, "none", `stroke="#fff" stroke-width="8"`)}${t(820, 260, "JJ", 90, p.a, 700, "middle")}
${[0, 1, 2].map((i) => `${r(60 + i * 320, 420, 300, 120, "#faf8f3", 14, 'stroke="#e8e4da"')}${r(80 + i * 320, 440, 90, 80, i % 2 ? p.b : p.suave, 10)}${lineas(190 + i * 320, 448, [140, 110, 90], "#e3ded2", 11, 22)}`).join("")}`),
    ventana(p, "portafolio.vercel.app/admin", `${navBarra(p, "Panel privado")}
${t(40, 120, "Proyectos", 30, "#1b1a17", 700)}${r(860, 92, 160, 42, p.a, 21)}${t(940, 119, "+ Nuevo proyecto", 14, "#fff", 600, "middle")}
${[0, 1, 2, 3].map((i) => `${r(40, 160 + i * 96, 980, 80, "#fff", 12, 'stroke="#e8e4da"')}${r(40, 160 + i * 96, 6, 80, i === 2 ? "#cfc8b8" : p.a, 3)}${t(70, 195 + i * 96, `${i + 1}. ${["Portafolio personal", "Gestor de tareas", "API de clima", "Tienda en línea"][i]}`, 18, "#1b1a17", 600)}${t(70, 220 + i * 96, i === 2 ? "Borrador (oculto) · 2 capturas" : "Publicado · 3 capturas", 13, "#6b6558")}
${["↑ Subir", "↓ Bajar", "Editar", "Eliminar"].map((b, j) => `${r(600 + j * 102, 180 + i * 96, 92, 38, j === 2 ? p.a : "#fff", 19, j === 2 ? "" : `stroke="${j === 3 ? "#a3261b" : p.a}" stroke-width="1.5"`)}${t(646 + j * 102, 204 + i * 96, b, 13, j === 2 ? "#fff" : j === 3 ? "#a3261b" : p.a, 600, "middle")}`).join("")}`).join("")}`),
    telefono(p, `${r(0, 0, 266, 50, "#fff", 0)}${r(16, 12, 26, 26, p.a, 7)}${r(196, 12, 56, 26, "#fff", 13, `stroke="${p.a}"`)}${t(224, 30, "Menú", 11, p.a, 600, "middle")}
${t(20, 100, "Hola, soy", 26, "#1b1a17", 700)}${t(20, 132, "Juan José", 26, p.a, 700)}${lineas(20, 150, [220, 200, 170], "#e3ded2", 9, 18)}${r(20, 220, 226, 40, p.a, 20)}${t(133, 245, "Ver proyectos", 13, "#fff", 600, "middle")}
${[0, 1].map((i) => `${r(20, 290 + i * 160, 226, 140, "#faf8f3", 12, 'stroke="#e8e4da"')}${r(20, 290 + i * 160, 226, 70, i ? p.b : p.suave, 12)}${lineas(34, 372 + i * 160, [150, 110], "#e3ded2", 9, 18)}`).join("")}`),
  ],

  tareas: (p) => [
    ventana(p, "tareas.app/tablero", `${navBarra(p, "Tareas")}
${["Por hacer", "En curso", "Hecho"].map((col, i) => `${r(30 + i * 340, 90, 320, 520, "#f6f5fb", 14)}${t(50 + i * 340, 125, col, 17, "#1b1a17", 700)}${r(250 + i * 340, 108, 36, 24, p.suave, 12)}${t(268 + i * 340, 125, String([4, 2, 5][i]), 13, p.a, 700, "middle")}
${[0, 1, 2].slice(0, [3, 2, 3][i]).map((j) => `${r(46 + i * 340, 150 + j * 140, 288, 122, "#fff", 12, 'stroke="#e6e4f0"')}${r(62 + i * 340, 168 + j * 140, [70, 90, 60][(i + j) % 3], 20, [p.suave, "#ffe2c7", "#d6f5e3"][(i + j) % 3], 10)}${lineas(62 + i * 340, 202 + j * 140, [230, 180], "#e6e4f0", 10, 20)}${c(310 + i * 340, 248 + j * 140, 12, p.b)}${i === 2 ? t(62 + i * 340, 252 + j * 140, "✓ completada", 12, "#1f6b3a", 600) : ""}`).join("")}`).join("")}`),
    ventana(p, "tareas.app/lista", `${navBarra(p, "Tareas")}
${t(40, 125, "Hoy", 30, "#1b1a17", 700)}${t(110, 125, "· 8 tareas", 18, "#6b6558")}${r(760, 98, 260, 40, "#f6f5fb", 20)}${t(785, 123, "🔍  Buscar tareas…", 14, "#8b87a0")}
${[0, 1, 2, 3, 4, 5].map((i) => `${r(40, 160 + i * 72, 980, 60, "#fff", 10, 'stroke="#ecebf3"')}${r(60, 178 + i * 72, 24, 24, i < 2 ? p.a : "#fff", 6, `stroke="${p.a}" stroke-width="2"`)}${i < 2 ? t(72, 196 + i * 72, "✓", 16, "#fff", 700, "middle") : ""}
${t(104, 196 + i * 72, ["Diseñar el tablero accesible", "Escribir pruebas de teclado", "Revisar contraste AA", "Documentar la API", "Atajos de teclado", "Publicar versión 1.0"][i], 17, i < 2 ? "#9a96aa" : "#1b1a17", 500, "start", F)}
${r(860, 176 + i * 72, 130, 28, [p.suave, "#ffe2c7", "#d6f5e3"][i % 3], 14)}${t(925, 195 + i * 72, ["Diseño", "Pruebas", "A11y"][i % 3], 13, "#3a3550", 600, "middle")}`).join("")}`),
    telefono(p, `${t(20, 40, "Hoy", 26, "#1b1a17", 700)}${t(20, 64, "5 de 8 pendientes", 12, "#6b6558")}${r(20, 80, 226, 8, "#ecebf3", 4)}${r(20, 80, 85, 8, p.a, 4)}
${[0, 1, 2, 3, 4, 5].map((i) => `${r(16, 110 + i * 70, 234, 58, "#fff", 10, 'stroke="#ecebf3"')}${r(30, 129 + i * 70, 20, 20, i < 3 ? p.a : "#fff", 5, `stroke="${p.a}" stroke-width="2"`)}${lineas(62, 126 + i * 70, [150, 90], i < 3 ? "#e6e4f0" : "#d5d2e3", 9, 16)}`).join("")}
${c(220, 560, 26, p.a)}${t(220, 570, "+", 30, "#fff", 600, "middle")}`),
  ],

  clima: (p) => [
    ventana(p, "clima.dev/panel", `${navBarra(p, "Clima API")}
${r(30, 90, 400, 250, p.a, 18)}${t(60, 140, "Bogotá", 22, "#fff", 600)}${t(60, 165, "Martes · 14:00", 14, "#ffe9d6")}${t(60, 265, "18°", 96, "#fff", 700)}${c(340, 200, 50, "#ffd166")}${c(370, 230, 38, "#fff", 'opacity=".9"')}${c(330, 240, 30, "#fff", 'opacity=".9"')}${t(60, 315, "Parcialmente nublado · Humedad 72 %", 14, "#ffe9d6")}
${[0, 1, 2, 3, 4].map((i) => `${r(450 + i * 116, 90, 104, 150, "#fff8f1", 14, 'stroke="#f3dcc6"')}${t(502 + i * 116, 120, ["Mié", "Jue", "Vie", "Sáb", "Dom"][i], 14, "#6b4a33", 600, "middle")}${c(502 + i * 116, 160, 18, i % 2 ? "#cbd5e1" : "#ffd166")}${t(502 + i * 116, 215, `${[19, 21, 17, 16, 20][i]}°`, 22, "#3b2617", 700, "middle")}`).join("")}
${r(450, 260, 580, 300, "#fff", 14, 'stroke="#f3dcc6"')}${t(475, 295, "Temperatura (7 días)", 16, "#3b2617", 700)}
<polyline points="480,500 560,450 640,470 720,400 800,420 880,360 960,380 1000,340" fill="none" stroke="${p.a}" stroke-width="4" stroke-linejoin="round"/>
<polygon points="480,500 560,450 640,470 720,400 800,420 880,360 960,380 1000,340 1000,530 480,530" fill="${p.b}" opacity=".35"/>
${r(30, 360, 400, 200, "#fff8f1", 14, 'stroke="#f3dcc6"')}${t(55, 395, "Calidad del aire", 16, "#3b2617", 700)}${r(55, 420, 350, 14, "#f3dcc6", 7)}${r(55, 420, 120, 14, "#3fb06b", 7)}${t(55, 470, "Buena · ICA 38", 22, "#1f6b3a", 700)}`),
    ventana(p, "clima.dev/docs", `${r(0, 0, 260, 598, "#fbf3ea", 0)}${t(30, 50, "Clima API", 20, "#3b2617", 700)}${["Introducción", "Autenticación", "GET /clima", "GET /pronostico", "Errores", "Límites"].map((s, i) => `${i === 2 ? r(18, 78 + i * 44, 224, 36, p.suave, 8) : ""}${t(34, 102 + i * 44, s, 15, i === 2 ? p.a : "#6b4a33", i === 2 ? 700 : 400)}`).join("")}
${r(300, 30, 70, 28, "#1f6b3a", 6)}${t(335, 50, "GET", 14, "#fff", 700, "middle")}${t(385, 51, "/api/clima?ciudad=bogota", 20, "#3b2617", 600, "start", MONO)}
${lineas(300, 85, [620, 560], "#ecdcc9", 11, 22)}${t(300, 160, "Respuesta 200", 16, "#3b2617", 700)}
${r(300, 175, 720, 300, "#1e1b18", 12)}${['{', '  "ciudad": "Bogotá",', '  "temperatura": 18,', '  "unidad": "celsius",', '  "estado": "parcialmente nublado",', '  "humedad": 72,', '  "actualizado": "2026-11-17T14:00:00Z"', '}'].map((l, i) => t(325, 210 + i * 32, l, 17, ["#e6d3bf", "#f5b971", "#9ad1ff", "#f5b971", "#9ad1ff", "#f5b971", "#9ad1ff", "#e6d3bf"][i], 400, "start", MONO)).join("")}
${t(300, 515, "Errores: 400 · 401 · 404 · 429", 15, "#6b4a33", 600)}`),
    telefono(p, `${r(0, 0, 266, 300, p.a, 0)}${t(133, 50, "Bogotá", 18, "#fff", 600, "middle")}${c(133, 120, 40, "#ffd166")}${t(133, 230, "18°", 64, "#fff", 700, "middle")}${t(133, 270, "Parcialmente nublado", 12, "#ffe9d6", 400, "middle")}
${[0, 1, 2, 3, 4].map((i) => `${r(16, 316 + i * 56, 234, 46, "#fff8f1", 10)}${t(32, 345 + i * 56, ["Mié", "Jue", "Vie", "Sáb", "Dom"][i], 13, "#6b4a33", 600)}${c(140, 339 + i * 56, 10, i % 2 ? "#cbd5e1" : "#ffd166")}${t(234, 345 + i * 56, `${[19, 21, 17, 16, 20][i]}°`, 14, "#3b2617", 700, "end")}`).join("")}`),
  ],

  tienda: (p) => [
    ventana(p, "tienda.shop/catalogo", `${navBarra(p, "Tienda Viva")}
${r(30, 84, 1000, 110, p.suave, 16)}${t(60, 130, "Rebajas de temporada", 28, "#4a0f2a", 700)}${t(60, 165, "Hasta 40 % en accesorios hechos a mano", 16, "#7a2a4f")}${r(820, 118, 170, 44, p.a, 22)}${t(905, 146, "Ver ofertas", 15, "#fff", 600, "middle")}
${[0, 1, 2, 3].map((i) => `${r(30 + i * 252, 214, 232, 360, "#fff", 14, 'stroke="#f1dbe6"')}${r(46 + i * 252, 230, 200, 180, ["#fde2ec", "#e0f2fe", "#fef3c7", "#dcfce7"][i], 12)}${c(146 + i * 252, 320, 52, ["#f472b6", "#38bdf8", "#f59e0b", "#22c55e"][i], 'opacity=".8"')}
${t(46 + i * 252, 440, ["Bolso tejido", "Lámpara azul", "Taza artesanal", "Maceta verde"][i], 16, "#2a1220", 600)}${t(46 + i * 252, 468, "★★★★☆", 14, "#f59e0b")}${t(46 + i * 252, 500, ["$ 89.900", "$ 120.000", "$ 35.500", "$ 42.000"][i], 20, "#2a1220", 700)}${r(46 + i * 252, 518, 200, 40, p.a, 20)}${t(146 + i * 252, 543, "Agregar al carrito", 14, "#fff", 600, "middle")}`).join("")}`),
    ventana(p, "tienda.shop/carrito", `${navBarra(p, "Tienda Viva")}
${t(40, 125, "Su carrito", 30, "#2a1220", 700)}
${[0, 1, 2].map((i) => `${r(40, 150 + i * 120, 620, 104, "#fff", 12, 'stroke="#f1dbe6"')}${r(56, 162 + i * 120, 80, 80, ["#fde2ec", "#e0f2fe", "#fef3c7"][i], 10)}${t(156, 192 + i * 120, ["Bolso tejido", "Lámpara azul", "Taza artesanal"][i], 18, "#2a1220", 600)}${t(156, 220 + i * 120, "Cantidad: " + (i + 1), 14, "#7a5a69")}${t(640, 205 + i * 120, ["$ 89.900", "$ 240.000", "$ 106.500"][i], 18, "#2a1220", 700, "end")}`).join("")}
${r(690, 150, 330, 330, "#fff7fa", 14, 'stroke="#f1dbe6"')}${t(715, 190, "Resumen", 20, "#2a1220", 700)}${["Subtotal", "Envío", "Descuento"].map((s, i) => `${t(715, 235 + i * 36, s, 15, "#7a5a69")}${t(995, 235 + i * 36, ["$ 436.400", "$ 12.000", "− $ 43.640"][i], 15, "#2a1220", 600, "end")}`).join("")}
<line x1="715" y1="345" x2="995" y2="345" stroke="#f1dbe6"/>${t(715, 385, "Total", 20, "#2a1220", 700)}${t(995, 385, "$ 404.760", 22, p.a, 700, "end")}${r(715, 415, 280, 46, p.a, 23)}${t(855, 444, "Pagar con seguridad", 15, "#fff", 600, "middle")}`),
    telefono(p, `${t(20, 40, "Catálogo", 24, "#2a1220", 700)}${r(20, 56, 226, 34, "#fff7fa", 17, 'stroke="#f1dbe6"')}${t(40, 78, "Buscar productos…", 12, "#a3889a")}
${[0, 1, 2, 3].map((i) => `${r(20 + (i % 2) * 118, 110 + Math.floor(i / 2) * 210, 108, 196, "#fff", 10, 'stroke="#f1dbe6"')}${r(28 + (i % 2) * 118, 118 + Math.floor(i / 2) * 210, 92, 92, ["#fde2ec", "#e0f2fe", "#fef3c7", "#dcfce7"][i], 8)}${lineas(28 + (i % 2) * 118, 222 + Math.floor(i / 2) * 210, [80, 50], "#f1dbe6", 8, 16)}${r(28 + (i % 2) * 118, 262 + Math.floor(i / 2) * 210, 92, 28, p.a, 14)}`).join("")}`),
  ],

  metricas: (p) => [
    ventana(p, "metricas.app/resumen", `${navBarra(p, "Métricas")}
${[0, 1, 2, 3].map((i) => `${r(30 + i * 252, 88, 232, 110, "#fff", 14, 'stroke="#dcefeb"')}${t(50 + i * 252, 120, ["Usuarios", "Ingresos", "Conversión", "LCP p75"][i], 14, "#4b6360")}${t(50 + i * 252, 165, ["12.480", "$ 8,2 M", "3,9 %", "1,6 s"][i], 30, "#10302c", 700)}${t(222 + i * 252, 165, ["▲ 12 %", "▲ 8 %", "▼ 0,4", "▲ 0,3 s"][i], 14, i === 2 ? "#a3261b" : "#1f6b3a", 700, "end")}`).join("")}
${r(30, 218, 640, 360, "#fff", 14, 'stroke="#dcefeb"')}${t(55, 252, "Visitas por mes", 17, "#10302c", 700)}
${[110, 160, 140, 210, 190, 250, 230, 280, 260, 300, 270, 320].map((h, i) => `${r(60 + i * 50, 550 - h, 32, h, i === 11 ? p.a : p.b, 6)}`).join("")}
${r(690, 218, 340, 360, "#fff", 14, 'stroke="#dcefeb"')}${t(715, 252, "Tráfico por canal", 17, "#10302c", 700)}
<circle cx="860" cy="400" r="95" fill="none" stroke="${p.a}" stroke-width="38" stroke-dasharray="270 600"/><circle cx="860" cy="400" r="95" fill="none" stroke="${p.b}" stroke-width="38" stroke-dasharray="160 600" stroke-dashoffset="-270"/><circle cx="860" cy="400" r="95" fill="none" stroke="#fbbf24" stroke-width="38" stroke-dasharray="167 600" stroke-dashoffset="-430"/>
${t(860, 410, "100 %", 20, "#10302c", 700, "middle")}${["Orgánico", "Redes", "Directo"].map((s, i) => `${r(720 + i * 100, 532, 14, 14, [p.a, p.b, "#fbbf24"][i], 3)}${t(740 + i * 100, 544, s, 13, "#4b6360")}`).join("")}`),
    ventana(p, "metricas.app/reportes", `${navBarra(p, "Métricas")}
${t(40, 125, "Páginas más visitadas", 28, "#10302c", 700)}${r(840, 98, 180, 40, "#f0faf8", 20, 'stroke="#dcefeb"')}${t(930, 123, "Últimos 30 días ▾", 14, "#10302c", 500, "middle")}
${r(40, 155, 980, 50, "#f0faf8", 10)}${["Página", "Visitas", "Tiempo", "Rebote", "Tendencia"].map((s, i) => t([60, 470, 620, 760, 880][i], 186, s, 14, "#4b6360", 700)).join("")}
${[0, 1, 2, 3, 4, 5].map((i) => `${t(60, 245 + i * 60, ["/", "/proyectos", "/contacto", "/proyectos/clima", "/blog/a11y", "/precios"][i], 16, "#10302c", 500, "start", MONO)}${t(470, 245 + i * 60, ["4.812", "2.977", "1.204", "988", "760", "512"][i], 16, "#10302c", 600)}${t(620, 245 + i * 60, ["1:42", "2:10", "0:58", "3:05", "4:12", "1:20"][i], 16, "#4b6360")}${t(760, 245 + i * 60, ["32 %", "28 %", "41 %", "22 %", "18 %", "47 %"][i], 16, "#4b6360")}
<polyline points="${[0, 1, 2, 3, 4, 5].map((k) => `${880 + k * 22},${238 + i * 60 - ((k * (i + 3)) % 5) * 4}`).join(" ")}" fill="none" stroke="${p.a}" stroke-width="2.5"/><line x1="40" y1="${265 + i * 60}" x2="1020" y2="${265 + i * 60}" stroke="#e5f2ef"/>`).join("")}`),
    telefono(p, `${t(20, 40, "Resumen", 24, "#10302c", 700)}${[0, 1].map((i) => `${r(16 + i * 120, 60, 112, 90, "#f0faf8", 10)}${t(28 + i * 120, 88, ["Usuarios", "Conversión"][i], 11, "#4b6360")}${t(28 + i * 120, 124, ["12.480", "3,9 %"][i], 22, "#10302c", 700)}`).join("")}
${r(16, 166, 234, 220, "#fff", 10, 'stroke="#dcefeb"')}${[60, 90, 80, 120, 110, 150, 140].map((h, i) => r(32 + i * 31, 370 - h, 20, h, i === 6 ? p.a : p.b, 4)).join("")}
${[0, 1, 2].map((i) => `${r(16, 402 + i * 52, 234, 44, "#f0faf8", 8)}${lineas(30, 418 + i * 52, [120], "#cfe7e2", 10)}${t(236, 430 + i * 52, ["▲ 12 %", "▲ 8 %", "▼ 2 %"][i], 12, i === 2 ? "#a3261b" : "#1f6b3a", 700, "end")}`).join("")}`),
  ],

  chat: (p) => {
    const burbuja = (x, y, w, mio, texto) =>
      `${r(mio ? x - w : x, y, w, 46, mio ? p.a : "#f1edfb", 18)}${t(mio ? x - w + 18 : x + 18, y + 29, texto, 15, mio ? "#fff" : "#2a1f45")}`;
    return [
      ventana(p, "chat.app/equipo", `${r(0, 0, 300, 598, "#f8f6fe", 0)}${t(24, 46, "Mensajes", 22, "#2a1f45", 700)}${r(20, 64, 260, 36, "#fff", 18, 'stroke="#e7e1f7"')}${t(40, 88, "Buscar…", 13, "#9a90b8")}
${["Equipo Frontend", "Laura Gómez", "Andrés Ruiz", "Soporte", "Diseño"].map((n, i) => `${i === 0 ? r(12, 116, 276, 70, "#ece6fd", 12) : ""}${c(48, 151 + i * 80, 22, [p.a, "#f472b6", "#38bdf8", "#f59e0b", "#22c55e"][i])}${t(82, 146 + i * 80, n, 15, "#2a1f45", 600)}${t(82, 168 + i * 80, ["¡Despliegue listo! 🚀", "¿Revisas el PR?", "Gracias 🙌", "Ticket #482 cerrado", "Nuevo prototipo"][i], 13, "#7a7096")}${i < 2 ? c(266, 151 + i * 80, 9, p.a) : ""}`).join("")}
${r(300, 0, 760, 64, "#fff", 0)}${c(340, 32, 18, p.a)}${t(370, 30, "Equipo Frontend", 17, "#2a1f45", 700)}${t(370, 50, "● 4 en línea", 12, "#1f6b3a")}<line x1="300" y1="64" x2="1060" y2="64" stroke="#eee9f9"/>
${burbuja(330, 100, 330, false, "¿Cómo va la prueba de accesibilidad?")}${burbuja(1030, 166, 300, true, "0 violaciones de axe en 3 anchos ✅")}${burbuja(330, 232, 250, false, "¡Excelente! ¿Y el LCP?")}${burbuja(1030, 298, 270, true, "1,6 s en móvil, p75 📈")}${burbuja(330, 364, 230, false, "Perfecto, despleguemos")}
${t(350, 450, "Laura está escribiendo…", 13, "#7a7096")}${r(320, 520, 620, 50, "#f8f6fe", 25, 'stroke="#e7e1f7"')}${t(345, 551, "Escriba un mensaje…", 14, "#9a90b8")}${c(985, 545, 25, p.a)}${t(985, 551, "➤", 18, "#fff", 400, "middle")}`),
      ventana(p, "chat.app/llamada", `${r(0, 0, 1060, 598, "#17122b", 0)}
${[0, 1, 2, 3].map((i) => `${r(30 + (i % 2) * 505, 24 + Math.floor(i / 2) * 260, 490, 245, ["#2b2250", "#3a2a6b", "#24345e", "#3b2350"][i], 16)}${c(275 + (i % 2) * 505, 130 + Math.floor(i / 2) * 260, 52, [p.b, "#f9a8d4", "#93c5fd", "#fcd34d"][i])}${r(46 + (i % 2) * 505, 228 + Math.floor(i / 2) * 260, 150, 28, "#000", 14, 'opacity=".45"')}${t(62 + (i % 2) * 505, 247 + Math.floor(i / 2) * 260, ["Juan José", "Laura", "Andrés", "Camila"][i], 13, "#fff", 600)}`).join("")}
${r(380, 540, 300, 50, "#2b2250", 25)}${[0, 1, 2, 3].map((i) => c(425 + i * 70, 565, 18, i === 3 ? "#ef4444" : "#4c3d8f")).join("")}`),
      telefono(p, `${r(0, 0, 266, 56, "#fff", 0)}${c(36, 28, 16, p.a)}${t(62, 26, "Equipo Frontend", 13, "#2a1f45", 700)}${t(62, 44, "● 4 en línea", 10, "#1f6b3a")}
${[[16, false, 170], [250, true, 180], [16, false, 140], [250, true, 160], [16, false, 190]].map(([x, mio, w], i) => r(mio ? x - w : x, 76 + i * 70, w, 50, mio ? p.a : "#f1edfb", 16)).join("")}
${r(12, 470, 242, 44, "#f8f6fe", 22, 'stroke="#e7e1f7"')}${c(232, 492, 16, p.a)}`),
    ];
  },
};

const PROYECTOS = [
  { slug: "portafolio-personal", tipo: "portafolio", a: "#1f5f4a", b: "#7fd1ad", suave: "#e3efe9" },
  { slug: "gestor-de-tareas", tipo: "tareas", a: "#3b4a8f", b: "#9fb3ff", suave: "#e5e9ff" },
  { slug: "api-de-clima", tipo: "clima", a: "#b4541f", b: "#ffc58f", suave: "#fde7d4" },
  { slug: "tienda-en-linea", tipo: "tienda", a: "#9d174d", b: "#f9a8d4", suave: "#fde2ec" },
  { slug: "panel-de-metricas", tipo: "metricas", a: "#0f766e", b: "#5eead4", suave: "#d5f5ef" },
  { slug: "chat-en-tiempo-real", tipo: "chat", a: "#6d28d9", b: "#c4b5fd", suave: "#ede9fe" },
];

await mkdir(new URL("../public/ejemplo/", import.meta.url), { recursive: true });
for (const p of PROYECTOS) {
  const vistas = pantallas[p.tipo](p);
  for (let i = 0; i < vistas.length; i++) {
    const nombre = `${p.slug}-${i + 1}.svg`;
    const svg = fondo(p, vistas[i], `${p.slug} captura ${i + 1}`).replace(/\n\s*/g, "");
    await writeFile(new URL(`../public/ejemplo/${nombre}`, import.meta.url), svg);
    console.log(`public/ejemplo/${nombre} (${(svg.length / 1024).toFixed(1)} kB)`);
  }
}
