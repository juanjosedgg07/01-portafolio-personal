"use client";
import { useSyncExternalStore } from "react";

type Tema = "claro" | "oscuro";
const CLAVE = "tema";

function temaActual(): Tema {
  return document.documentElement.dataset.theme === "oscuro" ? "oscuro" : "claro";
}

function suscribir(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

/** Script en línea (antes de pintar): tema guardado o el del sistema vía matchMedia; si no hay soporte, claro. */
export const scriptTema = `(function(){try{var t=localStorage.getItem("${CLAVE}");if(t!=="claro"&&t!=="oscuro"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"oscuro":"claro"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="claro"}})();`;

export function InterruptorTema() {
  const tema = useSyncExternalStore<Tema | null>(suscribir, temaActual, () => null);
  const oscuro = tema === "oscuro";

  function alternar() {
    const nuevo: Tema = oscuro ? "claro" : "oscuro";
    document.documentElement.dataset.theme = nuevo;
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      /* almacenamiento no disponible: el cambio dura solo esta visita */
    }
  }

  return (
    <button
      type="button"
      className="boton boton--secundario boton--pequeno"
      onClick={alternar}
      aria-pressed={tema === null ? undefined : oscuro}
      disabled={tema === null}
    >
      <span aria-hidden="true">{oscuro ? "☀" : "☾"}</span>
      <span>Tema oscuro</span>
    </button>
  );
}
