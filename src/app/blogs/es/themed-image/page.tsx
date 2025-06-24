import { ThemedImage } from "@/app/components";
import AuthorHeader from "@/app/components/authorHeader";
import CodeBlock from "@/app/components/codeBlock";
import { ThemeToggleButton } from "@/app/themes";
import ThemeSelector from "@/app/themes/themeSelector";
import { code, code_2, code_3, code_4, code_5, code_6 } from "./exampleCodes";
import TableOfContents from "@/app/components/content";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo crear una imagen dinámica según el tema en Next.js",
  description:
    "Aprende a crear un componente de imagen que cambia automáticamente según el tema claro u oscuro en Next.js, con ejemplos prácticos, configuración de Tailwind CSS y consideraciones de accesibilidad.",
  authors: [{ name: "Christopher Villamarín" }],
  openGraph: {
    title: "Cómo crear una imagen dinámica según el tema en Next.js",
    description:
      "Guía paso a paso para implementar imágenes adaptativas al tema en Next.js, incluyendo ejemplos, alternativas y mejores prácticas.",
    type: "article",
    locale: "es_ES",
  },
  keywords: [
    "Next.js",
    "ThemedImage",
    "tema oscuro",
    "tema claro",
    "imágenes dinámicas",
    "accesibilidad",
    "Tailwind CSS",
    "next-themes",
    "React",
    "frontend",
  ],
};


export default function ThemedImageBlog() {
  // Definir las secciones para la tabla de contenidos
  const sections = [
    { id: "introduccion", title: "Introducción" },
    { id: "componente", title: "El componente ThemedImage" },
    { id: "uso", title: "Ejemplos de uso" },
    { id: "configuracion", title: "Configuración de Tailwind CSS" },
    { id: "alternativa", title: "Alternativa sin next-themes" },
    { id: "accesibilidad", title: "Consideraciones de accesibilidad" },
    { id: "conclusion", title: "Conclusión y recomendaciones" },
  ];

  return (
    <main className="max-w-2xl mx-auto px-1 py-4 mobile:p-6 text-gray-900 dark:text-white">
      <article className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold">
          🌟 Cómo crear una imagen dinámica según el tema en Next.js 🚀
        </h1>
        <AuthorHeader
          name="Christopher Villamarín"
          date="2 de mayo de 2025"
          dateTime="2025-05-02"
        />

        {/* Tabla de contenidos */}
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Contenido del artículo</h2>
          <TableOfContents sections={sections} />
        </div>

        <section id="introduccion">
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            En el desarrollo web moderno,{" "}
            <strong>el adaptar los elementos de la interfaz de usuario</strong> al
            tema oscuro o claro no es solo una tendencia estética, sino una
            necesidad para mejorar la experiencia de usuario. Un tema oscuro puede 
            reducir la fatiga visual en entornos con poca luz, mientras que el tema 
            claro suele ser preferido en ambientes luminosos.
          </p>
          
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Uno de los desafíos menos abordados es cómo manejar imágenes que{" "}
            <strong>cambien automáticamente</strong> dependiendo del tema seleccionado.
            Piensa en casos como:
          </p>
          
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li>Logotipos que necesitan versiones claras y oscuras</li>
            <li>Ilustraciones que deben ser visibles en ambos temas</li>
            <li>Gráficos de datos cuya paleta debe adaptarse al fondo</li>
            <li>Iconos que requieren diferentes niveles de contraste</li>
          </ul>
          
          <p className="sm:text-lg text-gray-700 dark:text-gray-300">
            Hoy te mostraré cómo construir un{" "}
            <strong>componente de imagen reactivo</strong> en Next.js utilizando{" "}
            <code>next-themes</code>. Además, exploraremos cómo crear una
            alternativa personalizada sin depender de esta biblioteca para proyectos
            donde la ligereza sea prioritaria.
          </p>
        </section>

        <hr className="border-gray-400 dark:border-gray-600" />

        <section id="componente">
          <h2 className="text-2xl sm:text-3xl font-bold">
            🖼️ El componente <em>ThemedImage</em>
          </h2>
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Este componente permite <strong>mostrar diferentes imágenes</strong>{" "}
            dependiendo de si el usuario tiene el tema claro u oscuro activado, 
            mejorando significativamente el contraste y la visibilidad de los 
            elementos visuales en tu aplicación.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              <strong>💡 Beneficio clave:</strong> Al usar este componente, tus 
              imágenes se adaptarán automáticamente al cambiar el tema, sin necesidad 
              de lógica adicional en cada implementación.
            </p>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-3">
            🔥 Código del componente:
          </h3>
          <CodeBlock code={code} language="tsx" />
          
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded border-l-4 border-blue-500">
            <p className="text-sm">
              Este componente utiliza <code>useTheme</code> de <code>next-themes</code> para 
              detectar el tema activo y renderizar la imagen correspondiente.
            </p>
          </div>
        </section>

        <hr className="border-gray-400 dark:border-gray-600" />

        <section id="uso">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ejemplos de uso</h2>
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Veamos algunos ejemplos prácticos de cómo implementar nuestro componente 
            en diferentes contextos:
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Ejemplo básico con dos temas</h3>
          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex flex-row justify-left items-center mb-4">
              <p className="mr-2">Prueba cambiando el tema:</p>
              <ThemeToggleButton />
            </div>
            <ThemedImage
              srcForLight={"/paisaje-nevado.png"}
              srcForDark={"/mercado-navideño.png"}
              alt={"Ejemplo de imagen que cambia con el tema"}
              width={"300"}
              height={"300"}
            />
            <h3 className="mt-4 text-lg font-bold">Código:</h3>
            <CodeBlock code={code_3} language="tsx" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Caso de uso: Logo adaptativo</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Un uso común es para logotipos que necesitan buena visibilidad en ambos temas:
          </p>
          <CodeBlock 
            code={`<ThemedImage
  srcForLight="/logo-dark.svg"  // Logo oscuro para fondo claro
  srcForDark="/logo-light.svg"  // Logo claro para fondo oscuro
  alt="Logo de la empresa"
  width="120"
  height="40"
/>`} 
            language="tsx" 
          />
        </section>

        <hr className="border-gray-400 dark:border-gray-600" />

        <section id="configuracion">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            🎨 Configuración de Tailwind CSS v4 para el modo oscuro dinámico
          </h2>
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Para que nuestro componente funcione correctamente, necesitamos configurar 
            Tailwind CSS para soportar el cambio dinámico de temas. Añade lo siguiente 
            a tu archivo <code>globals.css</code>:
          </p>
          <CodeBlock code={code_4} language="css" />

          <p className="sm:text-lg text-gray-700 dark:text-gray-300 my-4">
            Si deseas ir más allá del simple modo claro/oscuro, puedes definir temas 
            adicionales:
          </p>
          <CodeBlock code={code_5} language="css" />

          <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-6">
            <p className="mb-3">Prueba los diferentes temas:</p>
            <ThemeSelector />
            <div className="my-4">
              <ThemedImage
                srcForLight={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Blancos.png/250px-Blancos.png"
                }
                srcForDark={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Colores_negros.png/330px-Colores_negros.png"
                }
                alt={"Paleta de colores adaptativa"}
                width={"200"}
                height={"200"}
                otherThemes={[
                  {
                    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Tipos_de_azules.png/250px-Tipos_de_azules.png",
                    theme: "blue",
                  },
                  {
                    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Shades_of_orange.svg/250px-Shades_of_orange.svg.png",
                    theme: "orange",
                  },
                  {
                    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Tipos_de_verde.png/250px-Tipos_de_verde.png",
                    theme: "green",
                  },
                ]}
              />
            </div>
            <h3 className="mt-3 text-lg font-bold">Código del componente:</h3>
            <CodeBlock code={code_6} language="tsx" />
          </div>
        </section>

        <hr className="border-gray-400 dark:border-gray-600" />

        <section id="alternativa">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            🔄 Alternativa sin <em>next-themes</em>
          </h2>
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Si prefieres{" "}
            <strong>
              no depender de <code>next-themes</code>
            </strong>{" "}
            para mantener tu proyecto más ligero o tienes requisitos específicos, 
            puedes crear tu propio <strong>hook personalizado</strong>{" "}
            <code>useTheme</code> utilizando <code>localStorage</code> y{" "}
            <code>matchMedia</code> para detectar el tema del usuario.
          </p>

          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg mb-4">
            <p className="text-green-800 dark:text-green-200">
              <strong>🌱 Ventajas:</strong> Esta implementación es más ligera y 
              te da control total sobre el comportamiento del selector de temas.
            </p>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold mb-3">
            🌟 Hook <code>useTheme</code> propio
          </h3>
          <CodeBlock code={code_2} language="tsx" />
          
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            Una vez implementado este hook, puedes utilizarlo en tu componente 
            <code>ThemedImage</code> reemplazando la importación de <code>next-themes</code>.
          </p>
        </section>
        
        <hr className="border-gray-400 dark:border-gray-600" />
        
        <section id="accesibilidad">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            ♿ Consideraciones de accesibilidad
          </h2>
          
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Al implementar imágenes que cambian según el tema, es importante considerar 
            aspectos de accesibilidad:
          </p>
          
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">
              <strong>Atributo alt descriptivo:</strong> Asegúrate de que el texto alternativo 
              describa adecuadamente la imagen, independientemente del tema.
            </li>
            <li className="mb-2">
              <strong>Contraste suficiente:</strong> Las imágenes deben mantener un 
              contraste adecuado con el fondo en ambos temas.
            </li>
            <li className="mb-2">
              <strong>Manejo de errores:</strong> Considera añadir un fallback cuando 
              una imagen no pueda cargarse:
            </li>
          </ul>
          
          <CodeBlock 
            code={`// Versión mejorada con manejo de errores
const ThemedImageWithFallback = ({ 
  srcForLight, 
  srcForDark, 
  fallbackSrc, 
  alt, 
  ...props 
}) => {
  const { theme } = useTheme();
  const [error, setError] = useState(false);
  
  const imageSrc = error 
    ? fallbackSrc 
    : theme === 'dark' ? srcForDark : srcForLight;
    
  return (
    <Image 
      src={imageSrc} 
      alt={alt} 
      onError={() => setError(true)}
      {...props} 
    />
  );
};`} 
            language="tsx" 
          />
        </section>

        <hr className="border-gray-400 dark:border-gray-600" />

        <section id="conclusion">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">🚀 Conclusión y recomendaciones</h2>
          
          <p className="sm:text-lg text-gray-700 dark:text-gray-300 mb-4">
            Implementar imágenes adaptativas al tema mejora significativamente 
            la experiencia de usuario en tu aplicación Next.js. Resumiendo los 
            puntos clave:
          </p>
          
          <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
            <li className="mb-2">
              <strong>
                <em>next-themes</em>
              </strong>{" "}
              ofrece una solución robusta y fácil de implementar para gestionar el tema.
            </li>
            <li className="mb-2">
              <strong>Un hook personalizado</strong> puede ser una alternativa ligera y
              adaptable para proyectos donde el tamaño importa.
            </li>
            <li className="mb-2">
              <strong>La accesibilidad</strong> debe ser una consideración primordial 
              al implementar cambios visuales basados en temas.
            </li>
            <li className="mb-2">
              <strong>Los temas múltiples</strong> pueden enriquecer la experiencia 
              para diferentes preferencias de usuarios.
            </li>
          </ul>
          
          <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4">
            <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
              💼 Recomendaciones prácticas:
            </h3>
            <ul className="list-disc pl-6 text-blue-700 dark:text-blue-300">
              <li>Prepara versiones de alta calidad para cada tema antes de implementar</li>
              <li>Considera precargar las imágenes de ambos temas para evitar parpadeos</li>
              <li>Para proyectos grandes, centraliza la gestión de imágenes temáticas</li>
              <li>Prueba el componente en diferentes dispositivos y tamaños de pantalla</li>
            </ul>
          </div>
          
          <p className="sm:text-lg text-gray-700 dark:text-gray-300">
            Con estas herramientas y consideraciones, estarás preparado para crear 
            interfaces que no solo sean estéticamente agradables en cualquier tema, 
            sino también accesibles y centradas en el usuario.
          </p>
        </section>
      </article>
    </main>
  );
}