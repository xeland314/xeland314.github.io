import CodeBlock from "@/app/components/codeBlock";
import React from "react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Execution Time Analysis - Christopher Villamarín Projects",
  description:
    "Explora Execution Time Analysis, un proyecto diseñado para analizar tiempos de ejecución en sistemas Unix utilizando Bash y AWK. Calcula promedios y desviaciones estándar de tiempo real, usuario y sistema.",
  keywords: [
    "Execution Time Analysis",
    "Unix",
    "Bash",
    "AWK",
    "tiempos de ejecución",
    "análisis de rendimiento",
    "desarrollo backend",
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
    title: "Execution Time Analysis - Proyecto de Christopher Villamarín",
    description:
      "Un proyecto para analizar tiempos de ejecución en sistemas Unix utilizando Bash y AWK. Ideal para comprender el rendimiento de comandos y programas.",
    url: "https://xeland314.github.io/projects/es/execution-time-analysis/",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/execution_time_analysis_preview.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Execution Time Analysis",
      },
    ],
  },
  robots: "index, follow", // Asegura que los motores de búsqueda rastreen e indexen esta página.
  metadataBase: new URL("https://xeland314.github.io"),
};


export default function ExecutionTimeAnalysisPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">⏱️ Execution Time Analysis</h1>
        <p className="text-lg">
          Este proyecto está diseñado para analizar los tiempos de ejecución de comandos o programas en sistemas Unix, calculando estadísticas clave como el promedio y la desviación estándar del tiempo real, usuario y del sistema.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🔍 Descripción del proyecto</h2>
        <p className="mb-4">
          El programa utiliza una combinación de Bash y AWK para recopilar datos sobre el tiempo de ejecución de un comando durante múltiples iteraciones. Estos tiempos se analizan para proporcionar información detallada sobre:
        </p>
        <ul className="list-disc pl-6 space-y-4">
          <li><strong>Tiempo real:</strong> El tiempo total que tomó la ejecución.</li>
          <li><strong>Tiempo de usuario:</strong> El tiempo que el procesador dedicó a ejecutar instrucciones de usuario.</li>
          <li><strong>Tiempo del sistema:</strong> El tiempo dedicado por el kernel del sistema operativo.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🛠️ Cómo funciona</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            <strong>Recolectar datos:</strong> 
            Un script en Bash ejecuta el comando proporcionado 10 veces usando <code>/usr/bin/time</code>, y guarda los resultados en un archivo temporal llamado <code>/tmp/exetime</code>.
          </li>
          <li>
            <strong>Procesamiento de datos:</strong> 
            Un script en AWK (<code>calc.awk</code>) lee el archivo de resultados y calcula:
            <ul className="list-disc pl-6">
              <li>Promedio del tiempo real, usuario y del sistema.</li>
              <li>Desviación estándar de cada tiempo.</li>
            </ul>
          </li>
          <li>
            <strong>Imprimir estadísticas:</strong> 
            Los resultados se imprimen en un formato legible con información sobre los tiempos y sus estadísticas.
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📋 Resultados esperados</h2>
        <p className="mb-4">
          Al ejecutar el programa, se obtiene un desglose detallado de cada iteración del comando, junto con el promedio y la desviación estándar de los tiempos de ejecución:
        </p>
        <pre className="p-4 rounded-md">
          {`Data:
-------------------------
real    user    sys
2.3     1.2     0.4
2.5     1.3     0.5
-------------------------
Average:
    real    2.4
    user    1.25
    sys     0.45
Standard deviation:
    real    0.1
    user    0.05
    sys     0.05`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">⚙️ Requisitos</h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            Instalar el comando <code>time</code>:
            <br /> Para sistemas Debian/Ubuntu: <code>sudo apt-get install time</code>
          </li>
          <li>
            Un entorno Unix compatible con Bash y AWK.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🚀 Cómo ejecutar</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li>
            Guarda el archivo de AWK (<code>calc.awk</code>) en tu sistema.
          </li>
          <li>
            Ejecuta el script Bash con el comando que deseas analizar:
            <CodeBlock code="bash speedtest.sh [comando]" />
          </li>
          <li>
            Revisa las estadísticas calculadas por AWK:
            <CodeBlock code="awk -f calc.awk /tmp/exetime" />
          </li>
        </ol>
      </section>

      <footer className="text-center">
        <p className="text-gray-600">Desarrollado por Christopher Villamarín.</p>
      </footer>
    </div>
  );
}
