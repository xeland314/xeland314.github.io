import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

// Banner del README (GitHub) y de LinkedIn con la estética de pixel-desk:
// pared negra con cuadrícula, fuentes pixel, barra de pestañas naranja y el
// gato sobre el escritorio dentro de una pantalla de pared.

const C = {
  bg: "#0b0b0b",
  grid: "#1a1a1a",
  orange: "#f1a449",
  cream: "#f9e6c6",
  sage: "#9c9e8f",
  ok: "#7cfb4c",
  floor: "#141414",
  frame: "#6b6b6b",
  frameDark: "#4a4a4a",
  bar: "#1e1e1e",
};

const font = (file: string) => fs.readFileSync(path.resolve("public/fonts/pixel", file));

export function getStaticPaths() {
  return [
    { params: { platform: "github-hero" } }, // /api/github-hero.svg
    { params: { platform: "github-hero-linkedin" } }, // /api/github-hero-linkedin.svg
  ];
}

export const GET: APIRoute = async ({ params }) => {
  const isLinkedIn = params.platform === "github-hero-linkedin";
  const width = 800;
  const height = 200;

  // Escena del gato (primer cuadro de gato.gif) dentro de una "pantalla" de
  // pared como la de pixel-desk. En LinkedIn la foto de perfil tapa la esquina
  // inferior izquierda: el texto se corre a la derecha y la pantalla se achica.
  const crop = isLinkedIn
    ? { left: 72, top: 24, width: 310, height: 176 } // gato + tocadiscos
    : { left: 20, top: 24, width: 440, height: 176 }; // laptop + gato + tocadiscos
  const shotH = 116; // la pantalla termina justo sobre la franja del piso
  const shotW = Math.round((crop.width * shotH) / crop.height);
  const shot = await sharp("public/images/pixel-desk/gato.gif", { page: 0 })
    .extract(crop)
    .resize(shotW, shotH, { kernel: "nearest" })
    .png()
    .toBuffer();
  const shotSrc = `data:image/png;base64,${shot.toString("base64")}`;
  const textLeft = isLinkedIn ? 200 : 32;

  const template = html`
    <div
      style="display: flex; position: relative; width: 100%; height: 100%;
        background-color: ${C.bg};
        background-image: linear-gradient(to right, ${C.grid} 1px, transparent 1px), linear-gradient(to bottom, ${C.grid} 1px, transparent 1px);
        background-size: 24px 24px;
        color: ${C.cream}; font-family: 'Silkscreen';"
    >
      <!-- Piso: franja naranja y suelo oscuro, como en la escena -->
      <div
        style="display: flex; position: absolute; left: 0; right: 0; bottom: 0; height: 14px;
          background-color: ${C.floor}; border-top: 4px solid ${C.orange};"
      ></div>

      <!-- Barra superior: usuario, pestañas y lugar -->
      <div
        style="display: flex; position: absolute; top: 10px; left: 20px; right: 20px; height: 20px;
          align-items: center; justify-content: space-between; font-size: 10px; letter-spacing: 2px;"
      >
        <span style="color: ${C.orange};">@XELAND314 · PIXEL DESK</span>
        <div style="display: flex; align-items: center;">
          <span style="display: flex; padding: 3px 8px; margin-left: 6px; background-color: ${C.orange}; color: ${C.bg};">1 PYTHON</span>
          <span style="display: flex; padding: 3px 8px; margin-left: 6px; color: ${C.sage};">2 APIS</span>
          <span style="display: flex; padding: 3px 8px; margin-left: 6px; color: ${C.sage};">3 LINUX</span>
        </div>
        <span style="font-family: 'VT323'; font-size: 18px; letter-spacing: 1px; color: ${C.cream};">QUITO, EC</span>
      </div>

      <!-- Nombre y rol -->
      <div
        style="display: flex; flex-direction: column; position: absolute; left: ${textLeft}px; top: 56px;"
      >
        <span style="font-family: 'Press Start 2P'; font-size: 22px; line-height: 30px; color: ${C.cream};">CHRISTOPHER</span>
        <span style="font-family: 'Press Start 2P'; font-size: 22px; line-height: 30px; color: ${C.cream};">VILLAMARÍN</span>
        <div style="display: flex; align-items: center; margin-top: 12px; font-family: 'VT323'; font-size: 22px; color: ${C.ok};">
          <span style="display: flex; width: 8px; height: 8px; background-color: ${C.ok}; margin-right: 10px;"></span>
          <span>$ backend developer_</span>
        </div>
      </div>

      <!-- Pantalla de pared con la escena -->
      <div
        style="display: flex; flex-direction: column; position: absolute; right: 24px; top: 38px;
          padding: 5px; background-color: ${C.frame}; border: 2px solid ${C.frameDark};"
      >
        <div style="display: flex; align-items: center; height: 14px; padding: 0 4px; background-color: ${C.bar};">
          <span style="display: flex; width: 6px; height: 6px; background-color: #e5484d; margin-right: 4px;"></span>
          <span style="display: flex; width: 6px; height: 6px; background-color: #f2c14e; margin-right: 4px;"></span>
          <span style="display: flex; width: 6px; height: 6px; background-color: ${C.ok}; margin-right: 8px;"></span>
          <span style="display: flex; flex: 1; height: 4px; background-color: #3a3a3a;"></span>
        </div>
        <img src="${shotSrc}" width="${shotW}" height="${shotH}" style="image-rendering: pixelated;" />
      </div>
    </div>
  `;

  const svg = await satori(template, {
    width,
    height,
    fonts: [
      { name: "Press Start 2P", data: font("PressStart2P-Regular.ttf"), weight: 400, style: "normal" },
      { name: "Silkscreen", data: font("Silkscreen-Regular.ttf"), weight: 400, style: "normal" },
      { name: "VT323", data: font("VT323-Regular.ttf"), weight: 400, style: "normal" },
    ],
  });

  const svgBuffer = Buffer.from(svg);

  return new Response(svgBuffer, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Length": svgBuffer.length.toString(),
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
};
