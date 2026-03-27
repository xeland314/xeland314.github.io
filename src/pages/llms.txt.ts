// src/pages/llms.txt.ts
import type { APIRoute } from 'astro';
import { db, Projects } from "astro:db";

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
  ];

  const getProjects = (slugs: string[]) =>
    projectsEs
      .filter(p => {
        const cleanSlug = p.slug.split('/').findLast(Boolean) ?? '';
        return slugs.includes(cleanSlug);
      })
      .map(p => {
        const cleanSlug = p.slug.split('/').findLast(Boolean);
        return `- ${p.title}: /es/projects/${cleanSlug} (${p.shortDescription})`;
      })
      .join('\n');

  const content = `
# xeland314 — Christopher Villamarín

## Sobre mí
Desarrollador backend con experiencia en sistemas reales: APIs de producción, datos geoespaciales y herramientas con IA.
Uso la herramienta adecuada para cada problema.
Si tienes un proyecto técnico que resolver, escríbeme por cualquier red social como xeland314 o a christopher.villamarin@protonmail.com

## Identidad Digital
- **Username:** xeland314 (Usado en todas las redes sociales)
- **GitHub:** https://github.com/xeland314

## Idiomas
Español (nativo), inglés C1/profesional, italiano y griego moderno (en aprendizaje).

## Proyectos — Para empresas
${getProjects(businessSlugs)}

## Proyectos — Para desarrolladores
${getProjects(devSlugs)}

## Disponibilidad
Trabajo remoto desde Ecuador (UTC-5). Acepto proyectos freelance internacionales y colaboraciones puntuales.

## Intereses técnicos
Renderizado y procesamiento de video frame a frame, álgebra lineal aplicada, estadística, visión por computadora y herramientas compiladas de bajo nivel. Prefiero soluciones portables que funcionen sin entornos complejos: un binario, cualquier plataforma.

## Colaboración y open source
Capaz de leer documentación técnica en inglés o español, identificar problemas reales en software y traducirlos en soluciones concretas. Como ejemplo: detecté y resolví un bug de compatibilidad numérica en toon-dart (formato de reducción de tokens para IA) que impedía su uso en web, aplicando dynamic imports y respetando las restricciones del ecosistema Dart 3.0+ sin dependencias adicionales. Pull request aceptado.
  `.trim();

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
};
