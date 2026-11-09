// src/pages/api/[lang]/projects/index.ts
import type { APIRoute } from 'astro';
import { getProjects } from "../../../data/content";

export function getStaticPaths() {
  return [
    { params: { lang: 'es' } },
    { params: { lang: 'en' } },
  ];
}

export const GET: APIRoute = async ({ params, url }) => {
  const { lang } = params;
  const isFeaturedParam = url.searchParams.get('featured') === 'true';

  // Si viene ?featured=true filtramos, si no, traemos todos del idioma
  try {
    const projects = getProjects(lang!, { featured: isFeaturedParam });

    // Si pidieron featured, limitamos a 6 como en tu lógica original
    const results = isFeaturedParam ? projects.slice(0, 6) : projects;

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "DB Error" }), { status: 500 });
  }
}
