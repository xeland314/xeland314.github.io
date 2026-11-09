// Contenido estático del portafolio (reemplaza a Astro DB).
// Aplica los mismos valores por defecto que tenía el esquema de la DB.
import { projectData } from "./projects";
import { projectDataEN } from "./projects.en";
import { certificates as certificatesES } from "./certificates";
import { certificatesEN } from "./certificates.en";
import { postData } from "./posts";
import { postDataEN } from "./posts.en";
import { blogData } from "./blogs";
import { blogDataEN } from "./blogs.en";

export type Lang = "es" | "en";

type Raw<T> = Partial<T> & Record<string, any>;

export interface Project {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  githubLink?: string | null;
  demoLink?: string | null;
  tags: string[];
  image?: string | null;
  slug: string;
  isFeatured: boolean;
  isVisible: boolean;
  lang: string;
}

export interface Certificate {
  id: number;
  logo: string;
  title: string;
  issuer: string;
  issueDate: string;
  date: string;
  credentialId: string;
  credentialUrl: string;
  skills: string[];
  isFeatured: boolean;
  lang: string;
}

export interface Post {
  id: number;
  title: string;
  url: string;
  image: string;
  lang: string;
  isPublished: boolean;
}

export interface Blog {
  id: number;
  title: string;
  description?: string | null;
  url: string;
  lang: string;
  isPublished: boolean;
  pubDate?: Date | null;
  githubLink?: string | null;
}

// El id replica el autoincrement de la DB (orden de inserción, desde 1).
const withIds = <T extends { id: number }>(rows: Record<string, any>[], defaults: Record<string, any>): T[] =>
  rows.map((r, i) => ({ ...defaults, ...r, id: i + 1 }) as T);

export const projects = withIds<Project>(
  [...projectData, ...projectDataEN] as Raw<Project>[],
  { isFeatured: false, isVisible: true, lang: "es" },
);

export const certificates = withIds<Certificate>(
  [...certificatesES, ...certificatesEN] as Raw<Certificate>[],
  { isFeatured: false, lang: "es" },
);

export const posts = withIds<Post>(
  [...postData, ...postDataEN] as Raw<Post>[],
  { isPublished: false, lang: "es" },
);

export const blogs = withIds<Blog>(
  [...blogData, ...blogDataEN] as Raw<Blog>[],
  { isPublished: false, lang: "es" },
);

// Comparación binaria de texto (igual que ORDER BY en SQLite).
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Proyectos de un idioma: destacados primero, luego por título. */
export function getProjects(
  lang: string,
  opts: { featured?: boolean; visibleOnly?: boolean; limit?: number } = {},
): Project[] {
  const result = projects
    .filter(
      (p) =>
        p.lang === lang &&
        (!opts.featured || p.isFeatured) &&
        (!opts.visibleOnly || p.isVisible),
    )
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || cmp(a.title, b.title));
  return opts.limit ? result.slice(0, opts.limit) : result;
}

/**
 * Certificados de un idioma. Por defecto: fecha ascendente (secciones destacadas);
 * con `newestFirst`: fecha y destacado descendentes, luego título (página completa).
 */
export function getCertificates(
  lang: string,
  opts: { featured?: boolean; newestFirst?: boolean; limit?: number } = {},
): Certificate[] {
  const dir = opts.newestFirst ? -1 : 1;
  const result = certificates
    .filter((c) => c.lang === lang && (!opts.featured || c.isFeatured))
    .sort(
      (a, b) =>
        dir * cmp(a.date, b.date) ||
        (opts.newestFirst
          ? Number(b.isFeatured) - Number(a.isFeatured)
          : Number(a.isFeatured) - Number(b.isFeatured)) ||
        cmp(a.title, b.title),
    );
  return opts.limit ? result.slice(0, opts.limit) : result;
}

/** Posts publicados; `recent` los ordena del más nuevo al más antiguo (id desc). */
export function getPosts(lang: string, opts: { recent?: boolean; limit?: number } = {}): Post[] {
  const result = posts.filter((p) => p.lang === lang && p.isPublished);
  if (opts.recent) result.sort((a, b) => b.id - a.id);
  return opts.limit ? result.slice(0, opts.limit) : result;
}

/** Blogs publicados ordenados por fecha de publicación descendente. */
export function getBlogs(lang: string, opts: { limit?: number } = {}): Blog[] {
  const result = blogs
    .filter((b) => b.lang === lang && b.isPublished)
    .sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));
  return opts.limit ? result.slice(0, opts.limit) : result;
}
