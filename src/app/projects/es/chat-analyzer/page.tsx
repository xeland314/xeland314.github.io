import CodeBlock from "@/app/components/codeBlock";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "📊 chat-analyzer - Christopher Villamarín Projects",
  description:
    "Descubre chat-analyzer, una herramienta que analiza chats exportados de WhatsApp, mostrando la frecuencia de palabras y emojis usados. Genera nubes de palabras y tablas detalladas para un análisis visual.",
  keywords: [
    "chat-analyzer",
    "análisis de chats",
    "WhatsApp",
    "frecuencia de emojis",
    "frecuencia de palabras",
    "nubes de palabras",
    "Python",
    "Christopher Villamarín",
    "xeland314",
    "proyectos",
    "Ecuador"
  ],
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  openGraph: {
    title: "📊 chat-analyzer - Proyecto de Christopher Villamarín",
    description:
      "Analiza chats de WhatsApp con chat-analyzer. Descubre las palabras y emojis más usados y visualízalos en nubes de palabras y tablas interactivas.",
    url: "https://xeland314.github.io/projects/es/chat-analyzer/",
    type: "website",
    images: [
      {
        url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYzl7jxgLN9QGN4yvFYRzU5dMv3WMyJGhbeXYiEHwwtxUKDudXUINhxq3fhXmzv1JbmTVGImI07r0e/pubchart?oid=1886909932&amp;format=image",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto chat-analyzer",
      },
    ],
  },
  robots: "index, follow",
  metadataBase: new URL("https://xeland314.github.io"),
};


export default function ChatAnalyzerPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📊 chat-analyzer</h1>
        <p className="text-lg">
          Analiza la frecuencia de uso de emojis y palabras en un chat exportado
          de WhatsApp.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          📦 Requerimientos e instalación
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Versión de Python: <code>3.9.2</code>
          </li>
          <li>
            Las librerías necesarias son:
            <ul className="list-disc pl-6">
              <li>
                <code>emoji==2.2.0</code>
              </li>
              <li>
                <code>nltk==3.8</code>
              </li>
              <li>
                <code>rich==13.3.1</code>
              </li>
              <li>
                <code>typer==0.7.0</code>
              </li>
              <li>
                <code>wordcloud==1.8.2.2</code>
              </li>
            </ul>
          </li>
        </ul>
        <p className="mt-4">
          Clona el repositorio y navega al directorio del proyecto:
        </p>
        <CodeBlock
          code={`git clone https://github.com/xeland314/chat-analyzer.git && cd chat-analyzer`}
        />
        <p className="mt-4">Luego instala las dependencias necesarias:</p>
        <CodeBlock code={`pip3 install -r requirements.txt`} />
        <p className="mt-4">
          Antes de analizar un chat, ejecuta el siguiente comando para descargar
          recursos de NLTK:
        </p>
        <CodeBlock code={`python3 chat_analyzer.py --install`} />
        <p>También puedes usar el atajo:</p>
        <CodeBlock code={`python3 chat_analyzer.py -i`} />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">⚙️ Uso</h2>
        <p className="mb-4">
          Para analizar un chat, pasa el archivo del chat como argumento:
        </p>
        <CodeBlock code={`python3 chat_analyzer.py chat.txt`} />
        <p className="mt-4">
          Puedes personalizar el número de palabras y emojis más comunes que se
          mostrarán en el resumen:
        </p>
        <CodeBlock code={`python3 chat_analyzer.py chat.txt -w 50 -e 20`} />
        <CodeBlock
          code={`python3 chat_analyzer.py chat.txt --words 50 --emojis 20`}
        />
        <p className="mt-4">
          Por defecto, se mostrarán las 30 palabras más utilizadas y los 15
          emojis más comunes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          📤 Exporta tu chat desde WhatsApp
        </h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            Abre WhatsApp y ve a{" "}
            <strong>
              Ajustes &gt; Chats &gt; Historial de Chats &gt; Exportar Chat
            </strong>
            .
          </li>
          <li>Selecciona el chat que deseas analizar.</li>
          <li>
            Elige la opción de exportar solo texto (sin incluir archivos).
          </li>
          <li>
            Copia el archivo exportado a tu PC dentro del directorio del
            repositorio.
          </li>
          <li>¡Ahora estás listo para analizar tu chat!</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📊 Resultados</h2>
        <p className="mb-4">El programa generará los siguientes resultados:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Tabla de palabras más utilizadas por persona en el chat.</li>
          <li>Tabla de emojis más usados por persona en el chat.</li>
          <li>
            Una nube de palabras (<em>wordcloud</em>) con las palabras más
            usadas.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">⏱️ Tiempo de ejecución</h2>
        <p className="mb-4">
          El análisis puede tomar de 1 a 3 minutos dependiendo del tamaño del
          archivo y las capacidades de tu computadora.
        </p>
        <div className="text-center mt-4">
          <img
            src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQYzl7jxgLN9QGN4yvFYRzU5dMv3WMyJGhbeXYiEHwwtxUKDudXUINhxq3fhXmzv1JbmTVGImI07r0e/pubchart?oid=1886909932&amp;format=image"
            alt="Tiempo de ejecución"
            className="rounded-lg shadow-md mx-auto"
          />
        </div>
        <p className="mt-4 text-center">
          Los tiempos pueden variar dependiendo de las prestaciones de tu
          equipo.
        </p>
      </section>
    </div>
  );
}
