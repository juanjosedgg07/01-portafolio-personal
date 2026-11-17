"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Anima el contenido al entrar en pantalla (IntersectionObserver).
 * Sin soporte, sin JavaScript o con movimiento reducido: se muestra todo sin animación.
 */
export function Revelar({ children, como: Etiqueta = "div" }: { children: ReactNode; como?: "div" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const [estado, setEstado] = useState<"inicial" | "oculto" | "visible">("inicial");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Solo se oculta lo que aún no está en pantalla (evita parpadeos y CLS).
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) return;
    setEstado("oculto");
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setEstado("visible");
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const clase = estado === "oculto" ? "revelar--oculto" : estado === "visible" ? "revelar--visible" : undefined;
  return (
    <Etiqueta ref={ref as never} className={clase}>
      {children}
    </Etiqueta>
  );
}
