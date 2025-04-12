import CodeBlock from "@/app/components/codeBlock";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poli - Tetris - Christopher Villamarín Projects",
  description:
    "Descubre Poli - Tetris, un proyecto de videojuego inspirado en el clásico Tetris, desarrollado en Java. Aprende a jugar, utiliza controles personalizables y configura diferentes niveles de dificultad.",
  keywords: [
    "Poli Tetris",
    "videojuegos",
    "Tetris",
    "Java",
    "proyectos",
    "Christopher Villamarín",
    "xeland314",
    "desarrollo de videojuegos",
    "Linux",
    "tecnología",
    "Ecuador"
  ],
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  openGraph: {
    title: "Poli - Tetris - Proyecto de Christopher Villamarín",
    description:
      "Descubre Poli - Tetris, un videojuego inspirado en el clásico Tetris, desarrollado en Java. Configura niveles de dificultad, controla piezas y vive la experiencia en Linux.",
    url: "https://xeland314.github.io/projects/es/poli-tetris/",
    type: "website",
    images: [
      {
        url: "https://raw.githubusercontent.com/xeland314/PoliTetris/ff11e56a969100a17380a9b8b5713eb340b8ce19/images/tetris.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Poli - Tetris",
      },
    ],
  },
  robots: "index, follow", // Garantiza que los motores de búsqueda rastreen e indexen la página.
};

export default function PoliTetrisPage() {
  return (
    <div className="p-0 sm:p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Poli - Tetris</h1>
        <img
          src="https://raw.githubusercontent.com/xeland314/PoliTetris/ff11e56a969100a17380a9b8b5713eb340b8ce19/images/tetris.png"
          alt="Tetris"
          className="mx-auto mb-6"
        />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Iniciar el juego</h2>
        <p className="mb-4">
          En Linux ejecutar los comandos por terminal depende de tu versión de
          Java:
        </p>
        <div>
          <h3 className="text-xl font-bold mb-2">Java 11</h3>
          <CodeBlock code="java -jar Tetris-11.jar" />
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Java 17</h3>
          <CodeBlock code="java -jar Tetris-17.jar" />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Controles</h2>
        <p className="mb-4">
          La interfaz gráfica no posee ningún botón. Se han implementado métodos
          de teclado para jugar el juego como se muestra en la esquina inferior
          derecha del Tetris.
        </p>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Movimientos</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>↑: Rotar 45° pieza</li>
            <li>↓: Mover pieza hacia abajo</li>
            <li>←: Mover pieza hacia la izquierda</li>
            <li>→: Mover pieza hacia la derecha</li>
            <li>Space: Mover la pieza al fondo</li>
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-2">Cambiar dificultades</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>1: Fácil</li>
            <li>2: Normal</li>
            <li>3: Díficil</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Otros</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>P: Pausar juego</li>
            <li>R: Iniciar un juego nuevo</li>
            <li>T: Mostrar tabla de puntuaciones</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
