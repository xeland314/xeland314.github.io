"use client";
import React, { useState, useEffect } from "react";
import { IProjectInfo, ProjectCard, SmallProjectCard } from "./components";
import { projects } from "./info";
import Link from "next/link";

export default function ProjectsSection() {
  // Función para obtener 6 proyectos aleatorios
  const getRandomProjects = (projects: IProjectInfo[], num: number) => {
    const shuffled = [...projects].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  // Estado para los proyectos aleatorios
  const [randomProjects, setRandomProjects] = useState<IProjectInfo[]>([]);

  // Efecto para establecer los proyectos aleatorios después de la hidratación
  useEffect(() => {
    setRandomProjects(getRandomProjects(projects, 6));
  }, []);

  // Función para cambiar los proyectos aleatorios
  const handleRandomizeProjects = () => {
    setRandomProjects(getRandomProjects(projects, 6));
  };

  return (
    <section id="proyectos" className="py-6 md:py-8 px-10 mb-16">
      <h2 className="text-3xl font-bold mb-8">
        <a
          href="/projects"
          className="hover:text-blue-700 font-bold py-2 px-4 rounded"
        >
          Proyectos
        </a>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-auto">
        {randomProjects.map((project) => (
          <div key={project.title}>
            <div className="hidden md:block">
              <ProjectCard project={project} />
            </div>
            <div className="block md:hidden">
              <SmallProjectCard project={project} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button
          onClick={handleRandomizeProjects}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4"
        >
          Cambiar Proyectos
        </button>
        <Link
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          href="/projects"
        >
          Ver todos los proyectos
        </Link>
      </div>
    </section>
  );
}
