// Mini apps instalables por separado (PWA propia con scope = su ruta).
// Instalar desde /code-to-img/ instala solo Code to Image, no el portafolio.
// Se derivan de TOOLS: añadir una herramienta interna allí la vuelve instalable.
// Tras añadir una, regenerar iconos: node scripts/generate-app-icons.mjs
import { TOOLS } from "../components/bentos/tools-data";

// Tailwind 500/600 en hex (para iconos y theme_color, que no aceptan oklch en todos lados)
export const TW: Record<string, { 500: string; 600: string }> = {
  red: { 500: "#ef4444", 600: "#dc2626" },
  orange: { 500: "#f97316", 600: "#ea580c" },
  amber: { 500: "#f59e0b", 600: "#d97706" },
  green: { 500: "#22c55e", 600: "#16a34a" },
  emerald: { 500: "#10b981", 600: "#059669" },
  teal: { 500: "#14b8a6", 600: "#0d9488" },
  cyan: { 500: "#06b6d4", 600: "#0891b2" },
  sky: { 500: "#0ea5e9", 600: "#0284c7" },
  blue: { 500: "#3b82f6", 600: "#2563eb" },
  indigo: { 500: "#6366f1", 600: "#4f46e5" },
  violet: { 500: "#8b5cf6", 600: "#7c3aed" },
  purple: { 500: "#a855f7", 600: "#9333ea" },
  fuchsia: { 500: "#d946ef", 600: "#c026d3" },
  pink: { 500: "#ec4899", 600: "#db2777" },
  rose: { 500: "#f43f5e", 600: "#e11d48" },
};

/** "from-indigo-500 to-blue-600" -> ["#6366f1", "#2563eb"] */
export function gradientHex(gradient: string): [string, string] {
  const pick = (prefix: string, fallback: string) => {
    const m = gradient.match(new RegExp(`${prefix}-([a-z]+)-(500|600)`));
    return m ? (TW[m[1]]?.[m[2] as "500" | "600"] ?? fallback) : fallback;
  };
  return [pick("from", "#3b82f6"), pick("to", "#2563eb")];
}

export interface PwaApp {
  slug: string;
  name: string;
  description: string;
  colors: [string, string];
  icon: string;
}

export const PWA_APPS: PwaApp[] = TOOLS.filter((t) => !t.external && t.href.startsWith("/")).map((t) => ({
  slug: t.href.replace(/^\/|\/$/g, ""),
  name: t.title.es,
  description: t.description.es,
  colors: gradientHex(t.gradient),
  icon: t.icon,
}));

/** App a la que pertenece una ruta (con o sin "/" final), o undefined si es del portafolio */
export function appForPath(pathname: string): PwaApp | undefined {
  return PWA_APPS.find((a) => pathname === `/${a.slug}` || pathname.startsWith(`/${a.slug}/`));
}

export const appIcon = (slug: string, file: "icon-192.png" | "icon-512.png" | "icon-maskable-512.png") =>
  `/apps/${slug}/${file}`;
