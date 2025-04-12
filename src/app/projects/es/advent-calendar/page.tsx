import React from "react";
import AdventCalendarPreview from "./example";
import CodeBlock from "@/app/components/codeBlock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendario de Adviento Interactivo - Christopher Villamarín Projects",
  description:
    "Descubre el Calendario de Adviento Interactivo, desarrollado en Next.js y estilo pixelart. Cada día revela una sorpresa mientras celebramos la cuenta regresiva hacia la Navidad.",
  keywords: [
    "Calendario de Adviento",
    "interactivo",
    "Navidad",
    "Next.js",
    "React",
    "pixelart",
    "desarrollo web",
    "proyectos",
    "Christopher Villamarín",
    "xeland314",
    "Ecuador"
  ],
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  openGraph: {
    title: "Calendario de Adviento Interactivo - Christopher Villamarín",
    description:
      "Un calendario de adviento digital y festivo, desarrollado con tecnologías modernas como Next.js y React. Cada día revela una sorpresa interactiva.",
    url: "https://xeland314.github.io/projects/es/advent-calendar/",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/advent_calendar_preview.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del Calendario de Adviento Interactivo",
      },
    ],
  },
  robots: "index, follow", // Garantiza que los motores de búsqueda rastreen e indexen la página.
  metadataBase: new URL("https://xeland314.github.io"),
};

export default function AdventCalendarPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          🎄 Calendario de Adviento Interactivo
        </h1>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl text-center font-semibold mb-4">
          🌟 Reto de la Semana: 4 al 10 de Diciembre 🎄
        </h2>
        <p>
          <strong>Tema: </strong>
          ¡Crea un calendario de adviento digital para celebrar la cuenta
          regresiva hacia la Navidad!
        </p>
      </section>
      <section className="mb-8">
        <AdventCalendarPreview />
      </section>
      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Descripción</h2>
        <p className="mb-4">
          Este proyecto es un calendario de adviento digital desarrollado en
          Next.js y exportado como una página estática. Cada día, los usuarios
          pueden abrir una "ventana" que revela un mensaje o regalo virtual. El
          diseño está inspirado en las festividades, utilizando colores rojos,
          verdes, dorados y una tipografía festiva. Además, el proyecto tiene un
          estilo pixelart.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Detalles</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Muestra un calendario de diciembre con 24 días representados como
            cajas.
          </li>
          <li>
            Permite que los usuarios abran una nueva caja solo en o después del
            día correspondiente (usa la fecha del sistema).
          </li>
          <li>
            Cada caja revela un contenido sorpresa (mensaje, imagen o un GIF
            festivo).
          </li>
          <li>Utiliza animaciones suaves al abrir las cajas.</li>
          <li>
            Incluye un contador que muestra cuántos días faltan para Navidad.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Tecnologías Utilizadas</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Next.js</strong>: Framework de React para la creación de
            aplicaciones web.
          </li>
          <li>
            <strong>React</strong>: Biblioteca de JavaScript para construir
            interfaces de usuario.
          </li>
          <li>
            <strong>Tailwind CSS y CSS</strong>: Para el diseño y las
            animaciones.
          </li>
          <li>
            <strong>Pixelart</strong>: Estilo visual utilizado en el proyecto e
            imágenes creadas con{" "}
            <a
              href="https://github.com/aseprite/aseprite"
              className="text-blue-600 hover:underline"
            >
              Aseprite
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Instalación</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Clona el repositorio:</strong>
            <CodeBlock code="git clone https://github.com/xeland314/advent-calendar.git" />
          </li>
          <li>
            <strong>Navega al directorio del proyecto:</strong>
            <CodeBlock code="cd advent-calendar" />
          </li>
          <li>
            <strong>Instala las dependencias:</strong>
            <CodeBlock code="npm install" />
          </li>
          <li>
            <strong>Inicia el servidor de desarrollo:</strong>
            <CodeBlock code="npm run dev" />
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Despliegue</h2>
        <p>
          El proyecto está desplegado como una página estática y puede ser visto
          en el siguiente enlace:
        </p>
        <a
          href="https://xeland314.github.io/advent-calendar/"
          className="text-blue-600 hover:underline"
        >
          🔗 Proyecto: Calendario de Adviento
        </a>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Contribuciones</h2>
        <p className="mb-4">
          Las contribuciones son bienvenidas. Si deseas contribuir, por favor
          sigue los siguientes pasos:
        </p>
        <ol className="list-decimal pl-6 space-y-4">
          <li>Haz un fork del proyecto.</li>
          <li>
            Crea una nueva rama (
            <code>git checkout -b feature/nueva-funcionalidad</code>).
          </li>
          <li>
            Realiza tus cambios y haz commit (
            <code>git commit -m 'Añadir nueva funcionalidad'</code>).
          </li>
          <li>
            Sube tus cambios (
            <code>git push origin feature/nueva-funcionalidad</code>).
          </li>
          <li>Abre un Pull Request.</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Autor</h2>
        <p>
          <strong>Christopher Villamarín</strong> -{" "}
          <a
            href="https://github.com/xeland314"
            className="text-blue-600 hover:underline"
          >
            GitHub
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Licencia</h2>
        <p>
          Este proyecto está bajo la Licencia MIT. Consulta el archivo{" "}
          <a href="/LICENSE" className="text-blue-600 hover:underline">
            LICENSE
          </a>{" "}
          para más detalles.
        </p>
      </section>
    </div>
  );
}
