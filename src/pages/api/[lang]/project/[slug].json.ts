// src/pages/api/[lang]/projects/[slug].ts
import { db, Projects } from "astro:db";

export async function getStaticPaths() {
  const allProjects = await db.select().from(Projects);
  
  return allProjects.map((p) => {
    // LIMPIEZA: Extraemos solo la última palabra del slug de la DB
    // Ej: "/en/projects/chat-analyzer" -> "chat-analyzer"
    const cleanSlug = p.slug.includes('/') 
      ? p.slug.split('/').filter(Boolean).pop() 
      : p.slug;

    return {
      params: { 
        lang: p.lang, 
        slug: cleanSlug // Esta será la URL real: /api/en/projects/chat-analyzer
      },
      props: { project: p } // Pasamos el proyecto completo para no repetir la query
    };
  });
}

export const GET: APIRoute = async ({ props }) => {
  // Como ya encontramos el proyecto en getStaticPaths, lo devolvemos directamente
  return new Response(JSON.stringify(props.project), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
