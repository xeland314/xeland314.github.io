import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import fs from "node:fs";
import path from "node:path";
import { projectDataEN } from "../../data/projects.en";
import { postDataEN } from "../../data/posts.en";

// Proyectos más recientes: projects.en.ts lista primero lo más nuevo.
// Se usa el nombre del repo (último segmento de githubLink) porque es corto y reconocible.
const RECENT_PROJECTS = projectDataEN
  .filter((p) => p.githubLink && (p as { isVisible?: boolean }).isVisible !== false)
  .slice(0, 3)
  .map((p) => p.githubLink!.replace(/\/+$/, "").split("/").pop()!);

// Posts: posts.en.ts agrega lo más nuevo al final.
const LATEST_POST = [...postDataEN].reverse().find((p) => p.isPublished)?.title;

// Años como programador profesional (desde jun. 2023), igual que BentoHero.
const START = new Date("2023-06-01");
const YEARS = Math.max(
  1,
  Math.floor((Date.now() - START.getTime()) / (365.25 * 24 * 3600 * 1000)),
);

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
          <span style="color: #10b981;">Python / Go / Linux</span>
          <span>•</span>
          <span>${YEARS}+ yrs coding</span>
          <span>•</span>
          <span>Quito, EC</span>
        </div>

        <div
          style="display: flex; gap: 10px; font-size: 13px; color: #6b7280; margin-top: 12px; ${isLinkedIn
            ? ""
            : "justify-content: center;"}"
        >
          <span style="color: #3b82f6;">new:</span>
          <span style="color: #d1d5db;">${RECENT_PROJECTS.join(" · ")}</span>
        </div>

        <div
          style="display: ${LATEST_POST ? "flex" : "none"}; gap: 10px; font-size: 13px; color: #6b7280; margin-top: 4px; ${isLinkedIn
            ? ""
            : "justify-content: center;"}"
        >
          <span style="color: #3b82f6;">post:</span>
          <span style="color: #d1d5db;">${LATEST_POST ?? ""}</span>
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
