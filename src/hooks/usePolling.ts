"use client";
import { useEffect, useRef } from "react";

/** Ejecuta `fn` cada `ms` mientras la pestaña esté visible. */
export function usePolling(fn: () => void, ms: number, activo = true) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });

  useEffect(() => {
    if (!activo) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") ref.current();
    }, ms);
    return () => window.clearInterval(id);
  }, [ms, activo]);
}
