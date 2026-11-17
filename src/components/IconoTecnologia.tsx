import { Code } from "lucide-react";
import {
  siChartdotjs,
  siCss,
  siDocker,
  siExpress,
  siFigma,
  siFirebase,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siOpenapiinitiative,
  siPostgresql,
  siPython,
  siReact,
  siRedux,
  siSocketdotio,
  siStripe,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVitest,
  siZod,
  type SimpleIcon,
} from "simple-icons";

/** Nombre normalizado → ícono de marca. Se importan solo los usados (tree-shaking). */
const ICONOS: Record<string, SimpleIcon> = {
  react: siReact,
  "next.js": siNextdotjs,
  nextjs: siNextdotjs,
  typescript: siTypescript,
  javascript: siJavascript,
  firebase: siFirebase,
  vercel: siVercel,
  "vercel blob": siVercel,
  "node.js": siNodedotjs,
  node: siNodedotjs,
  zod: siZod,
  openapi: siOpenapiinitiative,
  css: siCss,
  "css grid": siCss,
  html: siHtml5,
  git: siGit,
  github: siGithub,
  vitest: siVitest,
  "pruebas con vitest": siVitest,
  postgresql: siPostgresql,
  tailwind: siTailwindcss,
  "tailwind css": siTailwindcss,
  figma: siFigma,
  docker: siDocker,
  stripe: siStripe,
  redux: siRedux,
  express: siExpress,
  mongodb: siMongodb,
  "chart.js": siChartdotjs,
  "socket.io": siSocketdotio,
  python: siPython,
};

/** Luminancia relativa: logos casi negros o casi blancos usan el color del texto para verse en todos los temas. */
function colorVisible(hex: string): string {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l < 0.12 || l > 0.85 ? "currentColor" : `#${hex}`;
}

export function buscarIcono(nombre: string): SimpleIcon | undefined {
  return ICONOS[nombre.trim().toLowerCase()];
}

/** Ícono decorativo (aria-hidden): el nombre de la tecnología siempre va como texto al lado. */
export function IconoTecnologia({ nombre, tamano = 16 }: { nombre: string; tamano?: number }) {
  const icono = buscarIcono(nombre);
  if (!icono) return <Code aria-hidden="true" size={tamano} />;
  return (
    <svg role="img" aria-hidden="true" viewBox="0 0 24 24" width={tamano} height={tamano} fill={colorVisible(icono.hex)} focusable="false">
      <path d={icono.path} />
    </svg>
  );
}

/** Etiqueta de tecnología con ícono. */
export function EtiquetaTecnologia({ nombre }: { nombre: string }) {
  return (
    <span className="etiqueta etiqueta--icono">
      <IconoTecnologia nombre={nombre} />
      {nombre}
    </span>
  );
}
