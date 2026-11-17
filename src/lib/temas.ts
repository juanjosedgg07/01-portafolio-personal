/** Temas visuales disponibles. Los colores viven en app/globals.css como tokens CSS. */
export const TEMAS = [
  { id: "claro", nombre: "Claro", muestra: ["#fbfaf7", "#1f5f4a"] },
  { id: "oscuro", nombre: "Oscuro", muestra: ["#121411", "#7fd1ad"] },
  { id: "oceano", nombre: "Océano", muestra: ["#0b1420", "#6cc4ff"] },
  { id: "arena", nombre: "Arena", muestra: ["#fbf6ee", "#9c3d16"] },
  { id: "contraste", nombre: "Alto contraste", muestra: ["#000000", "#ffeb3b"] },
] as const;

export type IdTema = (typeof TEMAS)[number]["id"];
export const CLAVE_TEMA = "tema";

/**
 * Script en línea (antes de pintar, evita el parpadeo): tema guardado en localStorage;
 * si no hay, el del sistema con matchMedia (prefers-color-scheme / prefers-contrast); si falla, claro.
 */
export const scriptTema = `(function(){try{var v=${JSON.stringify(TEMAS.map((t) => t.id))};var t=localStorage.getItem("${CLAVE_TEMA}");if(v.indexOf(t)<0){var m=window.matchMedia;t=m&&m("(prefers-contrast: more)").matches?"contraste":m&&m("(prefers-color-scheme: dark)").matches?"oscuro":"claro"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="claro"}})();`;
