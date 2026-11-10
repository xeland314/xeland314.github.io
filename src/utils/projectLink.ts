// Enlace a la página de detalle de un proyecto. Si esa página no existe en el idioma pedido
// (p. ej. proyecto sin versión en inglés), se enlaza la versión en español en vez de generar un 404.
const pages = import.meta.glob("../pages/*/projects/*.astro");
const available = new Set(
  Object.keys(pages).map((p) => p.replace("../pages/", "").replace("/projects/", "/").replace(".astro", "")),
);

export function projectHref(lang: string, slug: string): string {
  const clean = slug.split("/").filter(Boolean).pop()!;
  if (available.has(`${lang}/${clean}`)) return `/${lang}/projects/${clean}/`;
  return `/es/projects/${clean}/`;
}
