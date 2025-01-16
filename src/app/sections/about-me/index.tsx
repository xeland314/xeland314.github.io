import React from "react";
import ProgrammingLanguages from "./languages";

const AboutMe = () => {
  return (
    <section
      id="about-me"
      className="xl:px-32 lg:px-24 md:px-16 sm:px-12 xs:px-10 px-6"
    >
      <h2 className="text-3xl text-center font-bold mb-8 border-b-2 border-b-gray-700 dark:border-b-slate-100 pb-4">
        Acerca de mí
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-x-16 md:pb-0 pb-10">
        <div className="scrolldown-animation-2">
          <h3 className="text-center text-2xl font-bold mb-8">
            Me llamo Christopher Villamarín
          </h3>
          <div className="flex justify-center mb-4">
            <img src="/profile.png" alt="Profile" width={128} height={128} className="bg-slate-700 dark:bg-white rounded-full" />
          </div>
          <p>
            Soy un desarrollador backend con experiencia en frontend. Creo APIs con Django y aplicaciones web con React. Despliego mis proyectos en AWS, Cloudflare y Render.
          </p>
          <p>
            Puedes ver más de mi trabajo en mi{" "}
            <a href="https://github.com/xeland314" className="text-blue-500">
              GitHub
            </a>
            .
          </p>
        </div>
        <div>
          <ProgrammingLanguages />
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
