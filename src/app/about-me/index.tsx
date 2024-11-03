import React from "react";

const AboutMe = () => {
  return (
    <section id="about-me" className="mb-16 max-lg:mx-36 max-md:mx-12 max-sm:mx-10">
      <h2 className="text-3xl font-bold mb-8">Acerca de mí</h2>
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">Hola, soy xeland314 (💻🐱)</h3>
        <p>
          Soy un desarrollador backend con experiencia en frontend. Creo APIs con Django y aplicaciones web con React o Flutter. También tengo experiencia en la creación de aplicaciones móviles con Flutter. Despliego proyectos en AWS, Cloudflare y Render.
        </p>
        <p>
          📫 Puedes contactarme en <a href="mailto:christopher.villamarin@protonmail.com" className="text-blue-500">christopher.villamarin@protonmail.com</a>
        </p>
        <p>
          <a className="text-blue-500" href="https://www.linkedin.com/in/christopher-villamar%c3%adn/">LinkedIn</a> | <a href="https://github.com/xeland314" className="text-blue-500">GitHub</a>
        </p>
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">🛠️ Tecnologías y Herramientas</h3>
        <ul className="list-disc list-inside">
          <li>Backend: Django</li>
          <li>Frontend: React, Flutter</li>
          <li>Móvil: Flutter</li>
          <li>Control de Versiones: Git</li>
          <li>Despliegue: AWS, Cloudflare, Render</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">📊 GitHub</h3>
        <p>Consulta mi trabajo en <a href="https://github.com/xeland314" className="text-blue-500">GitHub</a>.</p>
      </div>
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">Sobre mí</h3>
        <p>
          Soy un programador autodidacta con habilidades en aprendizaje rápido y resolución de problemas. Me aseguro de ofrecer un trabajo de alta calidad y eficiencia.
        </p>
        <p>
          He participado en diversos proyectos, creando soluciones interactivas y eficientes. Puedes ver más de mi trabajo en mi <a href="https://github.com/xeland314" className="text-blue-500">GitHub</a>.
        </p>
      </div>
    </section>
  );
};

export default AboutMe;
