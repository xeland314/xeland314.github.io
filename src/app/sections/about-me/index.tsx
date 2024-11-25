import React from "react";
import ProgrammingLanguages from "./languages";

const AboutMe = () => {
  return (
    <section
      id="about-me"
      className="mb-16 xl:px-40 lg:px-36 md:px-32 sm:px-12 px-10"
    >
      <h2 className="text-3xl font-bold mb-8">Acerca de mí</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12">
        <div className="mb-4">
          <h3 className="text-2xl font-bold mb-2">
            Hola, soy xeland314 (💻🐱)
          </h3>
          <p>
            Soy un desarrollador backend con experiencia en frontend. Creo APIs
            con Django y aplicaciones web con React o Flutter. También tengo
            experiencia en la creación de aplicaciones móviles con Flutter.
            Despliego proyectos en AWS, Cloudflare y Render.
          </p>
          <p>
            Soy un programador autodidacta con habilidades en aprendizaje rápido
            y resolución de problemas. Me aseguro de ofrecer un trabajo de alta
            calidad y eficiencia.
          </p>
          <p>
            He participado en diversos proyectos, creando soluciones
            interactivas y eficientes. Puedes ver más de mi trabajo en mi{" "}
            <a href="https://github.com/xeland314" className="text-blue-500">
              GitHub
            </a>
            .
          </p>
        </div>
        <div className="mb-4">
          <ProgrammingLanguages />
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
