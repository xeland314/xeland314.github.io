// Manifest propio de cada mini app: /code-to-img/manifest.webmanifest, etc.
// scope/start_url/id = la ruta de la app, así se instala solo esa app (no el portafolio).
import type { APIRoute, GetStaticPaths } from "astro";
import { PWA_APPS, appIcon, type PwaApp } from "../../data/pwa-apps";

export const getStaticPaths: GetStaticPaths = () =>
  PWA_APPS.map((app) => ({ params: { app: app.slug }, props: { app } }));

export const GET: APIRoute = ({ props }) => {
  const { app } = props as { app: PwaApp };
  const base = `/${app.slug}/`;
  const manifest = {
    id: base,
    name: app.name,
    short_name: app.name,
    description: app.description,
    lang: "es",
    start_url: base,
    scope: base,
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: app.colors[1],
    icons: [
      { src: appIcon(app.slug, "icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: appIcon(app.slug, "icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: appIcon(app.slug, "icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  });
};
