import CodeBlock from "@/app/components/codeBlock";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "📘 Objetos en C - Christopher Villamarín Projects",
  description:
    "Explora cómo implementar programación orientada a objetos en C basada en el libro 'Object-oriented Programming with ANSI-C' de Axel-Tobias Schreiner. Aprende sobre encapsulamiento, clases y manejo eficiente de memoria.",
  keywords: [
    "Objetos en C",
    "programación orientada a objetos",
    "ANSI-C",
    "encapsulamiento",
    "clases en C",
    "desarrollo en C",
    "Christopher Villamarín",
    "xeland314",
    "proyectos",
    "Ecuador",
  ],
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  openGraph: {
    title: "📘 Objetos en C - Proyecto de Christopher Villamarín",
    description:
      "Descubre cómo implementar programación orientada a objetos en C con ejemplos prácticos. Basado en el libro 'Object-oriented Programming with ANSI-C'.",
    url: "https://xeland314.github.io/projects/es/objects-in-c/",
    type: "website",
    images: [
      {
        url: "https://xeland314.github.io/images/objects_in_c_preview.png",
        width: 1200,
        height: 630,
        alt: "Vista previa del proyecto Objetos en C",
      },
    ],
  },
  robots: "index, follow",
  metadataBase: new URL("https://xeland314.github.io"),
};

export default function ObjectsInCPage() {
  return (
    <div className="p-0 sm:p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">📘 Objetos en C</h1>
        <p className="text-lg">
          Basado en el libro{" "}
          <a
            href="https://www.freetechbooks.com/object-oriented-programming-with-ansi-c-t551.html#:~:text=Object%2Doriented%20Programming%20with%20Ansi%2DC&text=Uses%20ANSI%2DC%20to%20discover,program%20to%20catch%20mistakes%20earlier."
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Object-oriented Programming with Ansi-C
          </a>{" "}
          de Axel-Tobias Schreiner.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🔹 Encapsulamiento</h2>
        <p className="mb-4">
          Se define un <code>struct</code> base llamado <code>Class</code>. A
          partir de este se pueden crear más objetos que hereden los mismos
          atributos y métodos. El diseño permite reutilizar y gestionar
          atributos de manera eficiente.
        </p>
        <pre className="p-4 rounded-md">
          {`typedef struct {
    size_t size;
    void * (* ctor) (void * self, va_list * app);
    void * (* dtor) (void * self);
    void * (* clone) (const void * self);
    size_t (* sizeOf) (const void * self);
    int (* differ) (const void * self, const void * other);
    char * (* toString) (const void * self);
} Class;
/* Métodos sobrecargados: */
void * new(const void * _class, ...);
void delete(void * self);
void * clone(const void * self);
int differ(const void * self, const void * other);
size_t sizeOf(const void * self);
char * toString(const void * self);`}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🔹 Uso del repositorio</h2>
        <p className="mb-4">
          El manejo de objetos permite simplificar la gestión de memoria en C.
          Considera el ejemplo de inicializar una cadena usando la clase{" "}
          <code>String</code>:
        </p>
        <pre className="p-4 rounded-md">
          {`#include "String.h"
#include <stdlib.h>

int main() {
    void * text = new(String, "Hola mundo");
    printf("%s", toString(text));
    return 0;
}`}
        </pre>
        <p className="mt-4">
          Este enfoque oculta el manejo de memoria en segundo plano, haciendo el
          código más limpio y legible.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          🔹 Funciones principales
        </h2>
        <ul className="list-disc pl-6 space-y-4">
          <li>
            <strong>Constructor:</strong> Inicializa cualquier objeto de forma
            estandarizada con <code>new()</code>. Por ejemplo:
            <CodeBlock code={`void * text = new(String, "Hello, world");`} />
          </li>
          <li>
            <strong>Clonador:</strong> Crea una copia independiente del objeto:
            <CodeBlock code="void * textCopy = clone(text);" />
          </li>
          <li>
            <strong>Destructor:</strong> Libera la memoria del objeto usando:
            <CodeBlock code="delete(text);" />
          </li>
          <li>
            <strong>toString:</strong> Retorna el contenido del objeto como una
            cadena imprimible:
            <CodeBlock code={`printf("text = %s\\n", toString(text));`} />
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📋 Ejemplos de uso</h2>
        <p className="mb-4">
          Para compilar los ejemplos y ver los resultados en consola, utiliza
          los comandos:
        </p>
        <CodeBlock code="make examples && make run_examples" />
        <p className="mt-4">
          El código de los ejemplos está en la carpeta <code>examples</code>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🧪 Tests</h2>
        <p className="mb-4">
          Para verificar la integridad de las funciones implementadas, puedes
          ejecutar los tests con:
        </p>
        <CodeBlock code="make tests" />
        <p className="mt-4">
          Los tests utilizan la librería{" "}
          <a
            href="https://github.com/mity/acutest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            acutest.h
          </a>
          . Esto permite agregar más funcionalidades y probarlas.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">🧹 Limpieza</h2>
        <p className="mb-4">
          Para eliminar todos los archivos compilados, utiliza el comando:
        </p>
        <CodeBlock code="make clean" />
      </section>
    </div>
  );
}
