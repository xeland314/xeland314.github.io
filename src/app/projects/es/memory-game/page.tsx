import MemoryGame from "./example";

export default function MemoryGamePage() {
  return (
    <div className="justify-center p-6">
      <header className="items-center justify-center text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🎮 Memory Game</h1>
        <p className="text-lg text-center mb-4">
          Este juego fue desarrollado con Vanilla JavaScript, CSS y HTML,
          destacando un enfoque limpio y eficiente para crear una experiencia
          interactiva desde cero.
        </p>
        <a
          href="https://xeland314.github.io/memory-game/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Ver el juego en vivo aquí
        </a>
        <MemoryGame />
      </header>

      <section className="flex flex-col justify-center items-center mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          🎮 Dificultades del juego
        </h2>
        <p className="mb-4 text-lg">
          El juego ofrece diferentes niveles de dificultad para adaptarse a
          jugadores de todos los niveles. Cada modo incrementa el número de
          pares de cartas y cartas totales, proporcionando un desafío creciente.
        </p>
        <table className="w-auto table-auto border-collapse text-center">
          <thead>
            <tr>
              <th className="border px-4 py-2">Modo de juego</th>
              <th className="border px-4 py-2">Pares de cartas</th>
              <th className="border px-4 py-2">Cartas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Fácil</td>
              <td className="border px-4 py-2">6</td>
              <td className="border px-4 py-2">12</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Normal</td>
              <td className="border px-4 py-2">9</td>
              <td className="border px-4 py-2">18</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Difícil</td>
              <td className="border px-4 py-2">12</td>
              <td className="border px-4 py-2">24</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="text-center text-2xl font-semibold mb-4">
          🚀 Tecnologías utilizadas
        </h2>
        <p className="text-left text-lg">
          Este proyecto fue desarrollado completamente utilizando tecnologías
          básicas para la web:
        </p>
        <ul className="list-disc pl-6 text-left text-lg">
          <li>
            <strong>Vanilla JavaScript:</strong> Para toda la lógica del juego y
            las interacciones dinámicas.
          </li>
          <li>
            <strong>CSS:</strong> Para los estilos visuales del juego,
            asegurando una apariencia atractiva y profesional.
          </li>
          <li>
            <strong>HTML:</strong> Para estructurar el contenido y la
            disposición de los elementos del juego.
          </li>
        </ul>
      </section>
    </div>
  );
}
