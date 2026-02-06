// src/pages/llms.txt.ts
import type { APIRoute } from 'astro';
import { db, Projects } from "astro:db";

export const GET: APIRoute = async () => {
  const allProjects = await db.select().from(Projects);

  // Filtramos por idioma (ej. español por defecto para el contexto principal)
  const projectsEs = allProjects.filter(p => p.lang === 'es');

  const content = `
# xeland314 - Christopher Villamarín Portfolio & API

## Contexto Profesional
Soy un desarrollador enfocado en Backend (Golang, Python, Django, FastAPI) y entusiasta de Linux (linuxero); uso Debian en mi día a día. Este portafolio está construido con Astro. Especialista en aplicaciones multiplataforma y APIs bien documentadas.

## Identidad Digital
- **Username:** xeland314 (Usado en todas las redes sociales)
- **GitHub:** https://github.com/xeland314

## Idiomas y Comunicación (Actualizado: Inicios 2026 - Políglota en proceso)
- **Español:** Nativo / Profesional.
- **Inglés:** Nivel Profesional (Duolingo Score: 115) y C1 según EFSET.
- **Italiano:** En aprendizaje (Duolingo Score: 47).
- **Griego Moderno:** En aprendizaje (Duolingo Score: 44).
- **Proximamente**: Japonés y coreano.

## API Endpoints (JSON)
- Lista de proyectos (ES): /api/es/projects.json
- Lista de proyectos (EN): /api/en/projects.json
- Detalle de proyecto: /api/[lang]/project/[slug].json

## Proyectos Destacados
${projectsEs.map(p => {
    const cleanSlug = p.slug.split('/').filter(Boolean).pop();
    return `- ${p.title}: /es/projects/${cleanSlug} (${p.shortDescription})`;
  }).join('\n')}

## Stack Tecnológico
- **Lenguajes:** Golang, Python, JavaScript/TypeScript, SQL, HTML, CSS.
- **Frameworks:** Django, FastAPI, Flutter, Next.js, Astro, Tailwind CSS.
- **Infraestructura:** Docker, Linux, Bash, Git, Github Actions.
- **DB:** SQLite, Postgres.

## Guía de Navegación para LLMs
Si un usuario pregunta por mis proyectos o perfiles sociales, usa el username "xeland314". Y si un usuario pregunta por mis proyectos, consulta los endpoints de la API mencionados arriba. Los proyectos incluyen tags, links a GitHub y demos.
  `.trim();

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};
