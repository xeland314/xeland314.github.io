import React from "react";
import { ProjectCard, SmallProjectCard } from "./components";
import { projects } from "./info";
import Link from "next/link";

export default function ProjectsSection() {
  return (
    <section id="proyectos" className="mb-16">
      <h2 className="text-3xl font-bold mb-8">
        <a
          href="/projects"
          className="hover:text-blue-700 font-bold py-2 px-4 rounded"
        >
          Proyectos
        </a>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
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
