// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import db from "@astrojs/db";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

const MY_SITE = "https://xeland314.github.io";

// https://astro.build/config
export default defineConfig({
  site: MY_SITE,
  build: {
    // Inline del CSS (30KB) en cada página: elimina la única petición
    // que bloquea el render (GitHub Pages no permite cambiar headers).
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Pre-bundlear para que las islas client:only no topen con 504
      // "Outdated Optimize Dep" en npm run dev
      include: ["leaflet", "react-leaflet"],
    },
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    preview: {
      headers: {
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
  },
  integrations: [
    {
      name: "sab-headers",
      hooks: {
        "astro:server:setup": ({ server }) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
          });
        },
      },
    },
    db(),
    react(),
    sitemap({
      // Páginas no indexadas por ahora (landing de servicios y volantes)
      filter: (page) =>
        !page.includes("/es/services") && !page.includes("/es/flyers"),
      customPages: [
        `${MY_SITE}/advent-calendar/`,
        `${MY_SITE}/memory-game/`,
        `${MY_SITE}/encriptador-de-texto/`,
        `${MY_SITE}/mapa-personalizado/`,
      ],
      i18n: {
        defaultLocale: "es",
        locales: {
          es: "es-EC",
          en: "en-US",
        },
      },
    }),
  ],
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  image: {
    service: passthroughImageService()
  }
});
