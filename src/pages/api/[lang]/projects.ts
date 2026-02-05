// src/pages/api/[lang]/projects/index.ts
import type { APIRoute } from 'astro';
import { db, Projects, eq, and, desc } from "astro:db";

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
  const queryFilter = isFeaturedParam 
    ? and(eq(Projects.lang, lang!), eq(Projects.isFeatured, true))
    : eq(Projects.lang, lang!);

  try {
    const projects = await db
      .select()
      .from(Projects)
      .where(queryFilter)
      .orderBy(desc(Projects.isFeatured), Projects.title);

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
