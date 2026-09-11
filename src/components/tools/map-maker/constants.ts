import type { TileProvider, ExportPresetId, PdfPageSizeId } from "./types";

export const STORAGE_KEY = "custom-map-maker:v2";
export const PROJECTS_KEY = "custom-map-projects:v1";
export const CURRENT_PROJECT_KEY = "custom-map-current-project";
export const ROTATION_KEY = "map-rotation-deg";
export const SHOW_NUMBER_KEY = "map-show-number";
export const GEOCODE_PROVIDER_KEY = "map-geocode-provider";
export const GEOAPIFY_KEY_STORAGE = "geoapify-api-key";
export const DEFAULT_GEOAPIFY_KEY = "d4d5a2e38d934da287b79d360de83e5d";

export const TILE_PROVIDERS: Record<TileProvider, { url: string; attribution: string; label: string }> = {
  osm: {
    label: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  voyager: {
    label: "Claro (Voyager)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO & OSM",
  },
  dark: {
    label: "Oscuro",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; CARTO & OSM",
  },
  satellite: {
    label: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Esri &mdash; &copy; Esri",
  },
};

export const EXPORT_PRESETS: Record<ExportPresetId, { label: string; w: number | null; h: number | null; aspect: string }> = {
  "1920x1080": { label: "Full HD 1920\u00D71080 (16:9)", w: 1920, h: 1080, aspect: "16/9" },
  "1350x1080": { label: "1350\u00D71080 (5:4)", w: 1350, h: 1080, aspect: "5/4" },
  A4: { label: "A4 2480\u00D73508 (300dpi) vertical", w: 2480, h: 3508, aspect: "210/297" },
  "A4-land": { label: "A4 horizontal 3508\u00D72480", w: 3508, h: 2480, aspect: "297/210" },
  "1080x1080": { label: "Cuadrado 1080\u00D71080 (1:1)", w: 1080, h: 1080, aspect: "1/1" },
  actual: { label: "Tamaño actual del mapa", w: null, h: null, aspect: "auto" },
};

export const PDF_PAGE_SIZES: Record<PdfPageSizeId, { wPt: number; hPt: number; label: string }> = {
  "1920x1080": { wPt: 1440, hPt: 810, label: "1920\u00D71080 px \u2192 1440\u00D7810 pt (16:9)" },
  "1350x1080": { wPt: 1012.5, hPt: 810, label: "1350\u00D71080 px \u2192 1013\u00D7810 pt (5:4)" },
  A4: { wPt: 595.28, hPt: 841.89, label: "A4 vertical 595\u00D7842 pt" },
  "A4-land": { wPt: 841.89, hPt: 595.28, label: "A4 horizontal 842\u00D7595 pt" },
  "1080x1080": { wPt: 810, hPt: 810, label: "Cuadrado 810\u00D7810 pt" },
};
