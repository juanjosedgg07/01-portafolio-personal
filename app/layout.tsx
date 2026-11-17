import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { PiePagina } from "@/src/components/PiePagina";
import { Encabezado } from "@/src/components/Encabezado";
import { scriptTema } from "@/src/lib/temas";
import { perfilServicio } from "@/src/services/perfilServicio";
import { urlSitio } from "@/src/lib/sitio";
import "./globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--fuente-sans", display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--fuente-serif", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const perfil = await perfilServicio.obtenerOpcional();
  const nombre = perfil?.nombre ?? "Portafolio";
  return {
    metadataBase: new URL(urlSitio()),
    title: { default: `${nombre} · Portafolio`, template: `%s · ${nombre}` },
    description: perfil?.titular ?? "Portafolio personal con proyectos, habilidades y contacto.",
    openGraph: { type: "website", locale: "es_CO", siteName: `${nombre} · Portafolio` },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#121411" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const perfil = await perfilServicio.obtenerOpcional();
  const nombre = perfil?.nombre ?? "Portafolio";
  return (
    <html lang="es" className={`${sans.variable} ${serif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Aplica el tema antes de pintar para evitar el parpadeo. Contenido estático, no de usuarios. */}
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body>
        <a href="#contenido" className="saltar">
          Saltar al contenido
        </a>
        <Encabezado nombre={nombre} />
        <main id="contenido" tabIndex={-1}>
          {children}
        </main>
        <PiePagina perfil={perfil} />
      </body>
    </html>
  );
}
