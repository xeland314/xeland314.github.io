import React from "react";
import { TextEncryptorPreview } from "./example";
import CodeBlock from "@/app/components/codeBlock";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🔐 Encriptador de Texto - Christopher Villamarín Projects",
  description:
    "Explora el Encriptador de Texto, un proyecto desarrollado para encriptar y desencriptar texto utilizando reglas específicas. Incluye una interfaz gráfica intuitiva creada con HTML, CSS y JavaScript.",
  keywords: [
    "Encriptador de Texto",
    "encriptación",
    "desencriptación",
    "HTML",
    "CSS",
    "JavaScript",
    "validación de texto",
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
    title: "🔐 Encriptador de Texto - Proyecto de Christopher Villamarín",
    description:
      "Encripta y desencripta texto utilizando reglas específicas con este proyecto desarrollado como parte del curso Alura ONE. Incluye una interfaz gráfica intuitiva.",
    url: "https://xeland314.github.io/projects/es/encriptador-de-texto/",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/encriptador.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Encriptador de Texto",
      },
    ],
  },
  robots: "index, follow",
};


export default function TextEncryptorPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">🔐 Encriptador de Texto</h1>
        <p className="text-lg">
          Un proyecto sencillo desarrollado para encriptar y desencriptar texto utilizando reglas específicas. Diseñado como parte del curso de Alura ONE.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📋 Descripción</h2>
        <p className="mb-4">
          Este encriptador de texto permite transformar cadenas ingresadas por el usuario con un conjunto de reglas predefinidas para encriptación y desencriptación. Además, cuenta con una interfaz gráfica sencilla desarrollada en HTML, CSS y JavaScript.
        </p>
        <p className="mb-4">
          Las funciones principales son validar el texto, encriptar, desencriptar y manejar el texto procesado, permitiendo su visualización, copiado o limpieza.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">⚙️ Funcionalidades</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Encriptar texto basado en las siguientes reglas:
            <ul className="list-disc pl-6">
              <li>
                <code>e → enter</code>
              </li>
              <li>
                <code>i → imes</code>
              </li>
              <li>
                <code>a → ai</code>
              </li>
              <li>
                <code>o → ober</code>
              </li>
              <li>
                <code>u → ufat</code>
              </li>
            </ul>
          </li>
          <li>Desencriptar texto para recuperar el mensaje original.</li>
          <li>Validar que el texto ingresado sea en minúsculas y sin acentos.</li>
          <li>Visualizar el texto encriptado o desencriptado en una interfaz de usuario intuitiva.</li>
          <li>Copiar el texto procesado al portapapeles.</li>
          <li>Limpiar los campos de entrada y salida.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🚀 Instalación</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            Clona el repositorio desde GitHub:
            <CodeBlock code={`git clone https://github.com/xeland314/encriptador-de-texto.git`} />
          </li>
          <li>Abre el proyecto en tu editor de texto favorito.</li>
          <li>
            Ejecuta el archivo <code>index.html</code> en tu navegador para iniciar la aplicación.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📜 Uso</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            Escribe el texto que deseas encriptar o desencriptar en el campo correspondiente.
          </li>
          <li>
            Presiona el botón <strong>Encriptar</strong> o <strong>Desencriptar</strong> según corresponda.
          </li>
          <li>El resultado aparecerá en el área de texto de salida.</li>
          <li>
            Usa las funciones <strong>Copiar</strong> o <strong>Limpiar</strong> según sea necesario.
          </li>
        </ol>
        <p className="mt-4">
          Nota: Si el texto ingresado no es válido (por ejemplo, contiene letras mayúsculas o acentos), se mostrará un mensaje de alerta.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📊 Resultados</h2>
        <TextEncryptorPreview />
      </section>

      <footer className="text-center">
        <h2 className="text-lg">
          Desarrollado por{" "}
          <a
            href="http://github.com/xeland314/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            xeland314
          </a>
        </h2>
      </footer>
    </div>
  );
}
