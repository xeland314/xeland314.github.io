export async function waitForFonts(): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }
}

async function fetchAsDataURL(url: string): Promise<string> {
  const res = await fetch(url, { credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status} descargando la fuente`);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function buildFontEmbedCSS(): Promise<string | null> {
  if (typeof document === "undefined") return null;

  const link = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ).find((l) => l.href && l.href.includes("fonts.googleapis.com"));

  if (!link) return null;

  try {
    const res = await fetch(link.href, { credentials: "omit" });
    if (!res.ok) return null;
    let cssText = await res.text();
    if (!cssText.includes("@font-face")) return null;

    const locations = cssText.match(/url\([^)]+\)/g) ?? [];
    await Promise.all(
      locations.map(async (loc) => {
        const match = /url\(["']?([^"')]+)["']?\)/.exec(loc);
        if (!match) return;
        const raw = match[1];
        const absolute = /^https?:/i.test(raw) ? raw : new URL(raw, link.href).href;
        const dataUri = await fetchAsDataURL(absolute);
        cssText = cssText.replace(loc, `url("${dataUri}")`);
      }),
    );

    return cssText;
  } catch (err) {
    console.warn("No se pudo incrustar las fuentes para el video:", err);
    return null;
  }
}

let fontEmbedCSSPromise: Promise<string | null> | null = null;

export function getFontEmbedCSS(): Promise<string | null> {
  if (!fontEmbedCSSPromise) {
    fontEmbedCSSPromise = buildFontEmbedCSS();
  }
  return fontEmbedCSSPromise;
}
