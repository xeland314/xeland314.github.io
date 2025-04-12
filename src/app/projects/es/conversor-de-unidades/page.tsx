import CodeBlock from "@/app/components/codeBlock";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "📏 Conversor de Unidades - Christopher Villamarín Projects",
  description:
    "Explora el Conversor de Unidades, un proyecto desarrollado como parte del Challenge #2 de Oracle Next Education. Convierte entre unidades de longitud, tiempo, temperatura y divisas mediante una interfaz gráfica intuitiva creada con Java Swing.",
  keywords: [
    "Conversor de unidades",
    "Java",
    "Swing",
    "desarrollo de aplicaciones",
    "conversiones de longitud",
    "conversiones de tiempo",
    "conversiones de temperatura",
    "conversiones de divisas",
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
    title: "📏 Conversor de Unidades - Proyecto de Christopher Villamarín",
    description:
      "Convierte unidades de longitud, tiempo, temperatura y divisas con este proyecto intuitivo desarrollado en Java Swing. Parte del Challenge #2 de Oracle Next Education.",
    url: "https://xeland314.github.io/projects/es/unit-converter/",
    type: "website",
    images: [
      {
        url: "https://raw.githubusercontent.com/xeland314/conversor-de-unidades/refs/heads/main/src/main/resources/conversor.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Conversor de Unidades",
      },
    ],
  },
  robots: "index, follow",
};


export default function UnitConverterPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          📏 Conversor de Unidades - Challenge #2 de Oracle Next Education (ONE)
        </h1>
        <p className="text-lg">
          Este es un proyecto de conversión de unidades desarrollado como parte
          del Challenge #2 de Oracle Next Education (ONE).
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          🎯 Descripción del proyecto
        </h2>
        <p>
          El conversor tiene una interfaz gráfica sencilla y puede realizar
          conversiones entre varias unidades de longitud, tiempo, temperatura y
          divisas.
        </p>
      </section>

      <section className="mb-8 text-center">
        <h2 className="text-3xl font-semibold mb-4">🎥 Demo</h2>
        <p className="text-lg">
          Mira una demostración del conversor de unidades en acción:
        </p>
        <div className="mt-4 flex justify-center">
          <img
            src="https://camo.githubusercontent.com/386f0895c30b88ec4e8a6f7e989e79a9dce4dbaf1c26a1d3b0917bb0fa89d38d/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f76312e59326c6b505463354d4749334e6a45784d475a685a6a46695a47526a5a6a4d77597a6c6b4d44566c5a6d46694f5759305a544d314e445a6c5a6d526d4f474d355a6d59784f535a6c634431324d563970626e526c636d35686246396e61575a7a583264705a6b6c6b4a6d4e305057632f5041476f565071336b34446d766344326c6a2f67697068792e676966"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          />
        </div>
      </section>

      <section className="mb-8 text-center">
        <h2 className="text-3xl font-semibold mb-4">🖥️ Interfaz gráfica</h2>
        <p>
          Este proyecto cuenta con una interfaz gráfica desarrollada en Java
          Swing para facilitar la interacción del usuario. Visualiza la interfaz
          completa:
        </p>
        <div className="mt-4 flex justify-center">
          <img
            src="https://raw.githubusercontent.com/xeland314/conversor-de-unidades/refs/heads/main/src/main/resources/conversor.png"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🔄 Funcionalidades</h2>
        <h3 className="text-2xl font-bold mb-2">Tipos de conversiones:</h3>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Longitud:</strong>
            <ul className="list-disc pl-6">
              <li>Milímetros (mm)</li>
              <li>Centímetros (cm)</li>
              <li>Decímetros (dm)</li>
              <li>Metros (m)</li>
              <li>Decámetros (dam)</li>
              <li>Hectómetros (hm)</li>
              <li>Kilómetros (km)</li>
            </ul>
          </li>
          <li>
            <strong>Tiempo:</strong>
            <ul className="list-disc pl-6">
              <li>Segundos (s)</li>
              <li>Minutos (min)</li>
              <li>Días (d)</li>
              <li>Semanas</li>
              <li>Meses</li>
              <li>Años</li>
            </ul>
          </li>
          <li>
            <strong>Temperatura:</strong>
            <ul className="list-disc pl-6">
              <li>Celsius (°C)</li>
              <li>Fahrenheit (°F)</li>
              <li>Rankine (°R)</li>
              <li>Kelvin (K)</li>
            </ul>
          </li>
          <li>
            <strong>Divisas:</strong>
            <ul className="list-disc pl-6">
              <li>Euro (EUR)</li>
              <li>Dólar (USD)</li>
              <li>Yen japonés (JPY)</li>
              <li>Won surcoreano (KRW)</li>
              <li>Libra esterlina (GBP)</li>
              <li>Peso colombiano (COP) (datos hasta 25 abril 2023)</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          🛠️ Herramientas utilizadas
        </h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Lenguaje de programación:</strong> Java (OpenJDK 17.0.6).
          </li>
          <li>
            <strong>Interfaz gráfica:</strong> Swing.
          </li>
          <li>
            <strong>Gestor de paquetes:</strong> Maven.
          </li>
          <li>
            <strong>Control de versiones:</strong> Git & GPG.
          </li>
          <li>
            <strong>IDEs:</strong> Visual Studio Code (para pruebas unitarias) y
            Eclipse (para la interfaz de usuario y la compilación).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          ⚙️ ¿Cómo ejecutar el conversor?
        </h2>
        <p className="mb-4">
          Puedes descargar el archivo ejecutable correspondiente a tu versión de
          Java y ejecutar el comando en tu consola:
        </p>
        <div>
          <h3 className="text-2xl font-bold">Java 11</h3>
          <CodeBlock code="java -jar conversor_11.jar" />
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">Java 17</h3>
          <CodeBlock code="java -jar conversor_17.jar" />
        </div>
      </section>
    </div>
  );
}
