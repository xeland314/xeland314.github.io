import CodeBlock from "@/app/components/codeBlock";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "📊 freqtables - Christopher Villamarín Projects",
  description:
    "Aprende a crear tablas de frecuencias simples y tablas con intervalos usando el paquete freqtables. Compatible con listas, tuplas y diccionarios para un manejo eficiente de datos.",
  keywords: [
    "freqtables",
    "tablas de frecuencias",
    "intervalos",
    "análisis de datos",
    "Python",
    "FreqTableSimple",
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
    title: "📊 freqtables - Proyecto de Christopher Villamarín",
    description:
      "Descubre cómo crear tablas de frecuencias simples y con intervalos utilizando el paquete freqtables. Ideal para análisis de datos en Python.",
    url: "https://xeland314.github.io/projects/es/freqtables/",
    type: "website",
    images: [
      {
        url: "https://raw.githubusercontent.com/xeland314/freqtables/refs/heads/main/examples/example0.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto freqtables",
      },
    ],
  },
  robots: "index, follow",
};


export default function FreqTablesPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📊 freqtables</h1>
        <p className="text-lg">
          Este paquete permite crear tablas de frecuencias simples dado un conjunto de variables con sus respectivas frecuencias. Este conjunto de datos puede ser una lista, tupla o un diccionario.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🔹 freqtablesimple</h2>
        <p className="mb-4">
          Aquí hay diferentes maneras de inicializar <code>FreqTableSimple</code> utilizando listas, diccionarios o argumentos individuales:
        </p>
        <pre className="p-4 rounded-md">
          {`import freqtable as ft

tabla1 = ft.FreqTableSimple([
    'A', 'A', 'A', 'B', 'B',
    'B', 'B', 'B', 'B', 'C'
])
tabla2 = ft.FreqTableSimple({
    'A':3, 'B':6, 'C':1
})
tabla3 = ft.FreqTableSimple(
    'A', 'A', 'A', 'B', 'B',
    'B', 'B', 'B', 'B', 'C'
)
tabla4 = ft.FreqTableSimple(
    A = 3, B = 6, C = 1
)`}
        </pre>
        <p className="mt-4">
          Cualquiera de estas inicializaciones dará como resultado una tabla similar a esta:
        </p>
        <div className="text-center mt-4">
          <img
            src="https://raw.githubusercontent.com/xeland314/freqtables/refs/heads/main/examples/example0.png"
            alt="Tabla simple"
            className="rounded-lg shadow-md mx-auto"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🔹 freqtable</h2>
        <p className="mb-4">
          También es posible crear una tabla de frecuencias con intervalos utilizando <code>freqtable.py</code>. Por ejemplo:
        </p>
        <pre className="p-4 rounded-md">
          {`# example1.py
import freqtable as ft

# Se crean 8 intervalos desde 0 con ancho de 4:
intervalos = ft.crear_intervalos(8, 0, 4)
frecuencias = [47, 32, 25, 20, 12, 5, 4, 5]
# Se inicializa la tabla con los intervalos y frecuencias:
tabla_con_intervalos = ft.FreqTable(intervalos, frecuencias)`}
        </pre>
        <p className="mt-4">
          Esto dará como resultado:
        </p>
        <pre className="p-4 rounded-md">
          {`print("Tabla #01".center(62, "~"))
print(tabla_con_intervalos)`}
        </pre>
        <div className="text-center mt-4">
          <img
            src="https://raw.githubusercontent.com/xeland314/freqtables/refs/heads/main/examples/example1.png"
            alt="Tabla con intervalos"
            className="rounded-lg shadow-md mx-auto"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📦 Instalación</h2>
        <p className="mb-4">Puedes clonar el repositorio y luego instalar las dependencias necesarias:</p>
        <CodeBlock code={`git clone https://github.com/xeland314/freqtables`}/>
        <CodeBlock code={`pip3 install -r requirements.txt`}/>
        <details className="mt-4">
          <summary className="cursor-pointer text-blue-600 hover:underline">requirements.txt</summary>
          <ul className="list-disc pl-6">
            <li>tabulate &gt;= 0.8.10</li>
          </ul>
        </details>
      </section>
    </div>
  );
}
