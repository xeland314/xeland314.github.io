// Genera los iconos PNG de cada mini app instalable (public/apps/<slug>/).
// Usa el icono Lucide y el degradado de cada herramienta en tools-data.ts.
// Uso: node scripts/generate-app-icons.mjs   (Node >= 22.18: importa .ts sin compilar)
import { mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// pwa-apps.ts importa tools-data sin extensión (estilo Vite); aquí se evalúa a mano
const toolsSrc = await readFile(join(root, "src/components/bentos/tools-data.ts"), "utf8");
const { TOOLS } = await import(
  "data:text/javascript," +
    encodeURIComponent(toolsSrc.replace(/export interface[\s\S]*?\n}\n/, "").replace(/: ToolCard\[\]/, ""))
);
const pwaSrc = await readFile(join(root, "src/data/pwa-apps.ts"), "utf8");
const TW = Function(
  `return ${pwaSrc.match(/export const TW[^=]*=\s*(\{[\s\S]*?\n\});/)[1]}`,
)();

const hex = (gradient, prefix, fallback) => {
  const m = gradient.match(new RegExp(`${prefix}-([a-z]+)-(500|600)`));
  return m ? (TW[m[1]]?.[m[2]] ?? fallback) : fallback;
};

const svg = ({ icon, from, to, maskable }) => {
  // maskable: fondo a sangre y glifo dentro de la zona segura (80% central)
  const glyph = maskable ? 260 : 300;
  const off = (512 - glyph) / 2;
  const bg = maskable
    ? `<rect width="512" height="512" fill="url(#g)"/>`
    : `<rect x="16" y="16" width="480" height="480" rx="112" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient></defs>
  ${bg}
  <svg x="${off}" y="${off}" width="${glyph}" height="${glyph}" viewBox="0 0 24 24" fill="none"
       stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
</svg>`;
};

const apps = TOOLS.filter((t) => !t.external && t.href.startsWith("/"));
for (const t of apps) {
  const slug = t.href.replace(/^\/|\/$/g, "");
  const from = hex(t.gradient, "from", "#3b82f6");
  const to = hex(t.gradient, "to", "#2563eb");
  const dir = join(root, "public/apps", slug);
  await mkdir(dir, { recursive: true });
  const any = Buffer.from(svg({ icon: t.icon, from, to, maskable: false }));
  const mask = Buffer.from(svg({ icon: t.icon, from, to, maskable: true }));
  await sharp(any).resize(512, 512).png().toFile(join(dir, "icon-512.png"));
  await sharp(any).resize(192, 192).png().toFile(join(dir, "icon-192.png"));
  await sharp(mask).resize(512, 512).png().toFile(join(dir, "icon-maskable-512.png"));
  console.log(`✓ ${slug}`);
}
