import type { APIRoute } from 'astro';
import { db, Projects } from "astro:db";

const SITE = "https://xeland314.github.io";

export const GET: APIRoute = async () => {
  const allProjects = await db.select().from(Projects);
  const projectsEs = allProjects.filter(p => p.lang === 'es');

  const businessSlugs = [
    'chat-analyzer',
    'post-metrics',
    'geocoding-api',
    'urlshortener',
    'codecraft-estimator',
  ];

  const devSlugs = [
    'code-to-video',
    'code-to-img',
    'catsplash',
  ];

  const getProjects = (slugs: string[]) =>
    projectsEs
      .filter(p => {
        const cleanSlug = p.slug.split('/').findLast(Boolean) ?? '';
        return slugs.includes(cleanSlug);
      })
      .map(p => {
        const cleanSlug = p.slug.split('/').findLast(Boolean);
        return `- [${p.title}](https://xeland314.github.io/es/projects/${cleanSlug}/): ${p.shortDescription}`;
      })
      .join('\n');

  const content = `
# xeland314 — Christopher Villamarín

Portafolio oficial de Christopher Villamarín (xeland314), desarrollador backend en Quito, Ecuador. Este documento resume el sitio para agentes de IA y LLMs. Todas las URLs son absolutas.

## Sobre mí
Desarrollador backend con experiencia en sistemas reales: APIs de producción, datos geoespaciales y herramientas con IA.
Uso la herramienta adecuada para cada problema.
Si tienes un proyecto técnico que resolver, escríbeme por cualquier red social como xeland314 o a christopher.villamarin@protonmail.com

## Páginas clave
- [Inicio](https://xeland314.github.io/): presentación, proyectos destacados y caso de estudio.
- [Proyectos](https://xeland314.github.io/es/projects/): catálogo completo con fichas técnicas.
- [Posts técnicos](https://xeland314.github.io/es/posts/): más de 40 artículos sobre Linux, redes, formatos y compiladores.
- [Casos de estudio](https://xeland314.github.io/es/study-cases/): resultados verificables con clientes reales.
- [Servicios](https://xeland314.github.io/es/services/): qué construyo para negocios y desarrolladores.
- [Herramientas](https://xeland314.github.io/mini-apps/): mini apps 100% offline en el navegador.

## Identidad Digital
- **Username:** xeland314 (Usado en todas las redes sociales)
- **GitHub:** [github.com/xeland314](https://github.com/xeland314)

## Idiomas
Español (nativo), inglés C1/profesional, italiano y griego moderno (en aprendizaje).

## Proyectos — Para empresas
${getProjects(businessSlugs)}

## Proyectos — Para desarrolladores
${getProjects(devSlugs)}

## Caso de estudio destacado
- [Talleres Servi Auto — caso de estudio](https://xeland314.github.io/es/study-cases/taller-servi-auto/): sitio completo para taller mecánico del sur de Quito, primer resultado orgánico en Google, Bing y Brave Search, y 100/100 en SEO PageSpeed.

## Herramientas para agentes de IA (WebMCP, experimental)

Si el navegador del agente soporta WebMCP (document.modelContext, Chrome 149+ origin trial), el sitio registra herramientas read-only:

- \`get_perfil\` — Perfil, idiomas, disponibilidad, email y redes.
- \`get_servicios\` — Servicios ofrecidos con descripción y URL.
- \`get_proyectos\` — Proyectos destacados con URL.
- \`get_caso_exito\` — Caso de estudio verificado con resultados SEO.
- \`get_contacto\` — Canales de contacto para iniciar un proyecto.
- \`get_apps\` — Mini apps offline en el navegador con URL.
- \`get_posts\` — Posts técnicos y artículos de blog con URL.

Catálogo estático de capacidades (ARD): https://xeland314.github.io/.well-known/ai-catalog.json

## Disponibilidad
Trabajo remoto desde Ecuador (UTC-5). Acepto proyectos freelance internacionales y colaboraciones puntuales.

## Intereses técnicos
Renderizado y procesamiento de video frame a frame, álgebra lineal aplicada, estadística, visión por computadora y herramientas compiladas de bajo nivel. Prefiero soluciones portables que funcionen sin entornos complejos: un binario, cualquier plataforma.

## Colaboración y open source
Capaz de leer documentación técnica en inglés o español, identificar problemas reales en software y traducirlos en soluciones concretas. Como ejemplo: detecté y resolví un bug de compatibilidad numérica en toon-dart (formato de reducción de tokens para IA) que impedía su uso en web, aplicando dynamic imports y respetando las restricciones del ecosistema Dart 3.0+ sin dependencias adicionales. Pull request aceptado.
  `.trim();

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/markdown; charset=utf-8" }
  });
};
