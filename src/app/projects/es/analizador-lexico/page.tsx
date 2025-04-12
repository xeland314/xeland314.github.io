import CodeBlock from "@/app/components/codeBlock";
import React from "react";
import NumberRecognitionTable from "./table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "🧮 Reconocedor de Expresiones Matemáticas - Christopher Villamarín Projects",
  description:
    "Descubre el Reconocedor de Expresiones Matemáticas, un analizador léxico diseñado para procesar y manejar operaciones matemáticas complejas. Integra C y Go para extender funcionalidades avanzadas.",
  keywords: [
    "Reconocedor de Expresiones Matemáticas",
    "análisis léxico",
    "compiladores",
    "matemáticas",
    "procesamiento numérico",
    "C",
    "Go",
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
    title: "🧮 Reconocedor de Expresiones Matemáticas - Proyecto de Christopher Villamarín",
    description:
      "Explora un analizador léxico que procesa operaciones matemáticas complejas y amplía sus capacidades con la integración de C y Go.",
    url: "https://xeland314.github.io/projects/es/math-expression-recognizer/",
    type: "website",
    images: [
      {
        url: "https://raw.githubusercontent.com/xeland314/Analizador-lexico/refs/heads/main/imgs/Captura1.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Reconocedor de Expresiones Matemáticas",
      },
    ],
  },
  robots: "index, follow",
};


export default function MathExpressionRecognizerPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          🧮 Reconocedor de Expresiones Matemáticas
        </h1>
        <p className="text-lg">
          Un proyecto enfocado en el desarrollo de un analizador léxico para
          reconocer, procesar y manejar operaciones matemáticas complejas.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📘 Introducción</h2>
        <p className="mb-4">
          El analizador léxico representa la primera etapa de un compilador,
          encargado de identificar errores y procesar los datos para avanzar a
          las siguientes fases. Este proyecto desarrolla un sistema que reconoce
          sistemas numéricos y utiliza expresiones regulares óptimas para
          cumplir con sus objetivos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🎯 Objetivos</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Reconocer valores numéricos de distintos sistemas de numeración.
          </li>
          <li>Realizar conversiones entre sistemas numéricos.</li>
          <li>
            Distinguir operadores aritméticos y signos de apertura/cierre.
          </li>
          <li>Reconocer funciones matemáticas.</li>
          <li>
            Implementar gramáticas para resolver operaciones básicas y
            avanzadas.
          </li>
          <li>
            Guardar valores ingresados para reutilizarlos como en lenguajes de
            programación.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          🔍 Descripción del problema
        </h2>
        <p className="mb-4">
          El usuario puede ingresar números que pertenecen a diferentes sistemas
          numéricos. El programa reconoce dichos sistemas, traduce las bases
          numéricas y distingue operadores aritméticos, signos de agrupación y
          funciones matemáticas mediante expresiones regulares.
        </p>
      </section>

      <NumberRecognitionTable />

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📚 C & Go</h2>
        <p className="mb-4">
          Para extender funciones matemáticas, el programa utiliza Go para
          exportar definiciones inexistentes en C, como la raíz cúbica. Esto se
          logra compilando el archivo <code>math_2.go</code> en una librería
          estática.
        </p>
        <CodeBlock code={`go build -buildmode=c-archive math_2.go`} />
        <p className="mt-4">
          Esto genera archivos <code>math_2.h</code> y <code>math_2.a</code> que
          se integran en el proyecto C durante la compilación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          🔧 Ejecución del programa
        </h2>
        <p className="mb-4">
          Compila y ejecuta el programa utilizando los siguientes comandos en la
          terminal de Ubuntu:
        </p>
        <pre className="p-4 rounded-md">
          {`yacc -d -v proyecto.y
lex reconocedor.l
gcc y.tab.c funciones.c lex.yy.c gofuncs/math_2.a -pthread -lfl -lm -o math_app
./math_app`}
        </pre>
        <p className="mt-4">
          O simplemente usa <code>make</code> para automatizar el proceso.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          📊 Ejemplos de ejecución
        </h2>
        <p className="mb-4">
          Para preparar operaciones, utiliza la entrada y salida en archivos:
        </p>
        <CodeBlock code={`./math_app < entrada.txt > salida.txt`} />
        <div className="text-center mt-4">
          <img
            src="https://raw.githubusercontent.com/xeland314/Analizador-lexico/refs/heads/main/imgs/Captura1.png"
            alt="Entrada"
            className="rounded-lg shadow-md mx-auto mb-4"
          />
          <img
            src="https://raw.githubusercontent.com/xeland314/Analizador-lexico/refs/heads/main/imgs/Captura2.png"
            alt="Salida"
            className="rounded-lg shadow-md mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
