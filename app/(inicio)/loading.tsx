export default function Cargando() {
  return (
    <section className="contenedor seccion" aria-busy="true" aria-live="polite">
      <p className="solo-lectores">Cargando contenido…</p>
      <div className="esqueleto" style={{ height: "1rem", width: "30%", marginBottom: "1rem" }} />
      <div className="esqueleto" style={{ height: "3rem", width: "70%", marginBottom: "1.5rem" }} />
      <div className="esqueleto" style={{ height: "1rem", width: "90%", marginBottom: "0.5rem" }} />
      <div className="esqueleto" style={{ height: "1rem", width: "80%", marginBottom: "2rem" }} />
      <div className="rejilla">
        {[1, 2, 3].map((i) => (
          <div key={i} className="esqueleto" style={{ aspectRatio: "4 / 3" }} />
        ))}
      </div>
    </section>
  );
}
