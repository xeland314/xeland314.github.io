import CodeBlock from "@/app/components/codeBlock";
import React from "react";

export default function PoliTetrisPage() {
  return (
    <div className="p-6">
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
