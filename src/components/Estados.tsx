/** Estados reutilizables de la interfaz: carga (esqueleto), vacío y error con reintento. */
export function EstadoCargando({ filas = 3, etiqueta = "Cargando…" }: { filas?: number; etiqueta?: string }) {
  return (
    <div aria-busy="true" role="status">
      <span className="solo-lectores">{etiqueta}</span>
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="esqueleto" style={{ height: "3.5rem", marginBottom: "0.75rem" }} />
      ))}
    </div>
  );
}

export function EstadoVacio({ children }: { children: React.ReactNode }) {
  return <p className="aviso">{children}</p>;
}

export function EstadoError({ mensaje, alReintentar }: { mensaje: string; alReintentar: () => void }) {
  return (
    <div className="aviso aviso--error" role="alert">
      <p>{mensaje}</p>
      <button type="button" className="boton boton--secundario boton--pequeno" onClick={alReintentar}>
        Reintentar
      </button>
    </div>
  );
}
