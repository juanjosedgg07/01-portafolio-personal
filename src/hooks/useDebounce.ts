"use client";
import { useEffect, useState } from "react";

/** Devuelve `valor` tras `ms` sin cambios (búsquedas mientras se escribe). */
export function useDebounce<T>(valor: T, ms = 300): T {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return retrasado;
}
