"use client";
import { Check, Palette } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { CLAVE_TEMA, TEMAS, type IdTema } from "@/src/lib/temas";
import estilos from "./SelectorTema.module.css";

function temaActual(): IdTema {
  const t = document.documentElement.dataset.theme;
  return (TEMAS.find((x) => x.id === t)?.id ?? "claro") as IdTema;
}

function suscribir(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

/** Aplica el tema al documento y lo recuerda en localStorage. */
function aplicarTema(id: IdTema) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(CLAVE_TEMA, id);
  } catch {
    /* sin almacenamiento: el cambio dura solo esta visita */
  }
}

/** Selector de tema: botón que abre un panel con opciones de radio nativas (accesible con teclado). */
export function SelectorTema() {
  const tema = useSyncExternalStore<IdTema | null>(suscribir, temaActual, () => null);
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const alClic = (e: MouseEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("keydown", alPulsar);
    document.addEventListener("mousedown", alClic);
    // Lleva el foco a la opción seleccionada
    raiz.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.removeEventListener("mousedown", alClic);
    };
  }, [abierto]);

  const nombre = TEMAS.find((t) => t.id === tema)?.nombre;

  return (
    <div ref={raiz} className={estilos.raiz}>
      <button
        ref={boton}
        type="button"
        className="boton boton--secundario boton--pequeno"
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((a) => !a)}
        disabled={tema === null}
      >
        <Palette aria-hidden="true" size={18} />
        <span>
          Tema<span className="solo-lectores">: {nombre}</span>
        </span>
      </button>
      <div id={idPanel} className={estilos.panel} hidden={!abierto}>
        <fieldset className={estilos.opciones}>
          <legend>Tema visual</legend>
          {TEMAS.map((t) => (
            <label key={t.id} className={estilos.opcion}>
              <input type="radio" name="tema" value={t.id} checked={tema === t.id} onChange={() => aplicarTema(t.id)} />
              <span className={estilos.muestra} aria-hidden="true" style={{ background: `linear-gradient(135deg, ${t.muestra[0]} 50%, ${t.muestra[1]} 50%)` }} />
              <span className={estilos.nombre}>{t.nombre}</span>
              {tema === t.id && <Check aria-hidden="true" size={18} className={estilos.check} />}
            </label>
          ))}
        </fieldset>
      </div>
    </div>
  );
}
