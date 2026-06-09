import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import fs from "node:fs";
import path from "node:path";

// 1. Definir qué archivos estáticos va a generar Astro en el build
export function getStaticPaths() {
  return [
    { params: { platform: "github-hero" } }, // Generará /api/github-hero.svg
    { params: { platform: "github-hero-linkedin" } }, // Generará /api/github-hero-linkedin.svg
  ];
}

export const GET: APIRoute = async ({ params }) => {
  const isLinkedIn = params.platform === "github-hero-linkedin";
  const fontPath = path.resolve("public/fonts/FiraCode-Regular.ttf");
  const fontData = fs.readFileSync(fontPath);
  const width = 800;
  const height = 200;

  const template = html`
    <div
      style="
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background-color: #030712;
        width: 100%;
        height: 100%;
        color: white;
        font-family: 'Fira Code';
        padding: 20px 40px;
        box-sizing: border-box;
      "
    >
      <div
        style="
          display: ${isLinkedIn ? "flex" : "none"};
          width: 140px;
          height: 140px;
          margin-top: 40px;
          margin-right: 30px;
        "
      ></div>

      <div
        style="display: flex; flex-direction: column; text-align: ${isLinkedIn
          ? "left"
          : "center"};"
      >
        <h1
          style="font-size: 36px; font-weight: bold; margin: 0; letter-spacing: -1px;"
        >
          Christopher Villamarín
        </h1>
        <p
          style="font-size: 18px; color: #3b82f6; margin-top: 4px; margin-bottom: 10px; ${isLinkedIn
            ? ""
            : "justify-content: center;"}"
        >
          Backend Developer · @xeland314
        </p>

        <div
          style="display: flex; gap: 15px; font-size: 14px; color: #9ca3af; ${isLinkedIn
            ? ""
            : "justify-content: center;"}"
        >
          <span style="color: #10b981;">Python / APIs / Linux</span>
          <span>•</span>
          <span>Quito, EC</span>
        </div>
      </div>
    </div>
  `;

  const svg = await satori(template, {
    width: width,
    height: height,
    fonts: [
      {
        name: "Fira Code",
        data: fontData,
        weight: 400,
        style: "normal",
      },
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
