import React from "react";
import ProgrammingLanguages from "./languages";

const AboutMe = () => {
  return (
    <article
      id="about-me"
      className="xl:px-32 lg:px-24 md:px-16 sm:px-12 xs:px-10 px-6"
    >
      <h2 className="text-3xl text-center font-bold pb-4 scrolldown-animation-2">
        Acerca de mí
      </h2>
      <hr className="pb-[1px] mb-4 scrolldown-animation-2 bg-gray-800 dark:bg-white" />
      <div className="grid grid-cols-1 md:grid-cols-2 justify-between sm:gap-x-6 md:pb-0 pb-10">
        <section id="about-me-text">
          <h3 className="text-center text-2xl font-medium mb-8 scrolldown-animation-2">
            Me llamo <strong>Christopher Alexander Villamarín Pila</strong>
          </h3>
          <div className="flex justify-center mb-4 scrolldown-animation-2">
            <img
              src="/profile.png"
              alt="Profile"
              width={128}
              height={128}
              className="bg-slate-700 dark:bg-white rounded-full"
            />
          </div>
          <p className="text-justify scrolldown-animation-2">
            Soy un apasionado desarrollador <strong>backend</strong> con experiencia en <strong>frontend</strong>. Mi enfoque está en crear <strong>soluciones sólidas</strong> que conecten a las personas con la tecnología de manera significativa. Disfruto diseñar <strong>APIs</strong> con <strong>Django</strong> y construir aplicaciones modernas con <strong>React</strong>, siempre buscando mejorar la experiencia del usuario.
          </p>
          <p className="text-justify scrolldown-animation-2">
            Me motiva aprender constantemente y enfrentar nuevos desafíos tecnológicos. En cada proyecto que desarrollo, busco no solo resolver problemas técnicos, sino también generar un <strong>impacto positivo</strong> en las personas que usan mis soluciones.
          </p>
          <p className="text-justify scrolldown-animation-2">
            Actualmente despliego mis proyectos en plataformas como <strong>AWS</strong>, <strong>Cloudflare</strong> y <strong>Render</strong>, aprovechando herramientas avanzadas para garantizar <strong>rendimiento</strong> y <strong>confiabilidad</strong>.
          </p>
          <p className="text-justify scrolldown-animation-2">
            Mi viaje profesional no solo se centra en la tecnología, sino también en colaborar con <strong>equipos</strong> y aportar una mentalidad de <strong>crecimiento</strong>. Creo firmemente que la combinación de habilidades técnicas y trabajo en equipo es clave para crear cosas increíbles.
          </p>
          <p className="text-center scrolldown-animation-2">
            Puedes explorar más de mi trabajo en mi{" "}
            <a
              href="https://github.com/xeland314"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              <strong>GitHub</strong>
            </a>{" "}
            o conectar conmigo en{" "}
            <a
              href="https://linkedin.com/in/christopher-villamarin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              <strong>LinkedIn</strong>
            </a>
            .
          </p>
        </section>
        <ProgrammingLanguages />
      </div>
    </article>
  );
};

export default AboutMe;
