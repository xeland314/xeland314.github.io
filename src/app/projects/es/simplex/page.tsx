import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "📊 Simplex - Christopher Villamarín Projects",
  description:
    "Descubre el método Simplex aplicado a la programación lineal. Aprende a maximizar ganancias y resolver problemas de optimización con ejemplos prácticos.",
  keywords: [
    "Simplex",
    "programación lineal",
    "optimización",
    "matemáticas aplicadas",
    "programación lineal ejemplos",
    "método Simplex",
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
    title: "📊 Simplex - Proyecto de Christopher Villamarín",
    description:
      "Aprende a utilizar el método Simplex para resolver problemas de optimización en programación lineal con ejemplos detallados.",
    url: "https://xeland314.github.io/projects/es/simplex/",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/simplex_preview.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Simplex",
      },
    ],
  },
  robots: "index, follow",
};

export default function SimplexPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📊 Simplex</h1>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Ejemplo de uso práctico</h2>
        <p className="mb-4">
          Supongamos que tienes una empresa que produce dos productos, A y B. Cada unidad de
          producto A que produces te genera una ganancia de $3 y cada unidad de producto B te
          genera una ganancia de $4. Quieres maximizar tus ganancias totales.
        </p>
        <p className="mb-4">
          Sin embargo, tienes algunas restricciones en la producción. Cada unidad de producto A
          requiere 2 horas de trabajo y cada unidad de producto B requiere 3 horas de trabajo. Tienes
          un total de 100 horas de trabajo disponibles. Además, cada unidad de producto A requiere
          1 kg de materia prima y cada unidad de producto B requiere 2 kg de materia prima. Tienes
          un total de 80 kg de materia prima disponibles.
        </p>
        <p className="mb-4">
          Este problema se puede formular como un problema de programación lineal con la siguiente
          función objetivo y restricciones:
        </p>
        
        <pre className="p-4 rounded-md mb-4">
          {`Maximizar: 3A + 4B
Sujeto a:
    2A + 3B <= 100
    A + 2B <= 80
    A >= 0
    B >= 0`}
        </pre>
        <p className="mb-4">
          Donde <code>A</code> y <code>B</code> representan el número de unidades producidas de los
          productos A y B, respectivamente.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Ejemplo de entrada y salida</h2>
        <p className="mb-4">Para resolver este problema, puedes ingresar los siguientes valores:</p>
        <ul className="list-disc pl-6 space-y-4">
          <li>Número de variables: <code>2</code></li>
          <li>Coeficientes de la función objetivo: <code>3</code> y <code>4</code></li>
          <li>Maximizar o minimizar: <code>1</code> (maximizar)</li>
          <li>Número de restricciones: <code>2</code></li>
          <li>
            Restricción 1:
            <ul className="list-disc pl-6">
              <li>Coeficientes: <code>2</code> y <code>3</code></li>
              <li>Desigualdad: <code>&lt;=</code></li>
              <li>Valor de <code>b</code>: <code>100</code></li>
            </ul>
          </li>
          <li>
            Restricción 2:
            <ul className="list-disc pl-6">
              <li>Coeficientes: <code>1</code> y <code>2</code></li>
              <li>Desigualdad: <code>&lt;=</code></li>
              <li>Valor de <code>b</code>: <code>80</code></li>
            </ul>
          </li>
        </ul>
        <p className="mt-4">
          Después de ingresar estos valores, la solución óptima es producir 20 unidades del producto A
          y 30 unidades del producto B para obtener una ganancia máxima de $180.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">Ejemplo adicional</h2>
        <p className="mb-4">Otro ejemplo con diferentes valores de entrada:</p>
        <ul className="list-disc pl-6 space-y-4">
          <li>Número de variables: <code>2</code></li>
          <li>Coeficientes de la función objetivo: <code>4</code> y <code>1</code></li>
          <li>Maximizar o minimizar: <code>0</code> (minimizar)</li>
          <li>Número de restricciones: <code>3</code></li>
          <li>
            Restricción 1:
            <ul className="list-disc pl-6">
              <li>Coeficientes: <code>3</code> y <code>1</code></li>
              <li>Desigualdad: <code>=</code></li>
              <li>Valor de <code>b</code>: <code>3</code></li>
            </ul>
          </li>
          <li>
            Restricción 2:
            <ul className="list-disc pl-6">
              <li>Coeficientes: <code>4</code> y <code>3</code></li>
              <li>Desigualdad: <code>&gt;=</code></li>
              <li>Valor de <code>b</code>: <code>6</code></li>
            </ul>
          </li>
          <li>
            Restricción 3:
            <ul className="list-disc pl-6">
              <li>Coeficientes: <code>1</code> y <code>2</code></li>
              <li>Desigualdad: <code>&lt;=</code></li>
              <li>Valor de <code>b</code>: <code>4</code></li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  );
}
