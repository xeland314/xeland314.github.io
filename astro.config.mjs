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
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    db(),
    react(),
    sitemap({
      customPages: [
        `${MY_SITE}/advent-calendar/`,
        `${MY_SITE}/memory-game/`,
        `${MY_SITE}/encriptador-de-texto/`,
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
