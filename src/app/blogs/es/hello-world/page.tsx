import AuthorHeader from "@/app/components/authorHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hello World - Mi Primer Blog",
  description:
    "Explora mi primer blog en el mundo del desarrollo web con Next.js y React.",
  keywords: ["Next.js", "React", "desarrollo web", "blog", "programación"],
  authors: { name: "Christopher Villamarín" },
  openGraph: {
    title: "Hello World - Mi Primer Blog",
    description:
      "Descubre cómo empezar un blog en Next.js con una configuración óptima para SEO.",
    type: "article",
    url: "https://xeland314.com/blogs/es/hello-world",
  },
  alternates: {
    canonical: "https://xeland314.com/blogs/es/hello-world",
  },
};

export default function HelloWorldBlog() {
  return (
    <main className="max-w-2xl mx-auto p-6 text-gray-900 dark:text-white">
      {/* Contenido del blog */}
      <article className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold">Hello World 🌍</h1>
        {/* Información del autor reutilizable */}
        <AuthorHeader
          name="Christopher Villamarín"
          date="2 de mayo de 2025"
          dateTime="2025-05-02"
        />
        <p className="sm:text-lg text-gray-700 dark:text-gray-300">
          ¡Bienvenido a mi primer blog! Este es el comienzo de mi viaje como
          creador de contenido en el mundo del desarrollo web.
        </p>
        <p className="sm:text-lg text-gray-700 dark:text-gray-300">
          En este espacio compartiré experiencias, proyectos y aprendizajes
          sobre tecnología, programación y arquitectura backend.
        </p>
        <p className="sm:text-lg text-gray-700 dark:text-gray-300">
          Mantente atento a futuras publicaciones, donde exploraremos temas
          avanzados en Next.js, React y más.
        </p>
      </article>
    </main>
  );
}
