"use client";

import React, { useState } from "react";
import { projects } from "../sections/projects/info";
import { ProjectCard } from "../sections/projects/components";
import Pagination from "./pagination";

const ITEMS_PER_PAGE = 5;

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const currentProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section id="projects" className="mb-16">
      <h2 className="text-3xl font-bold mb-8">Todos los Proyectos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentProjects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
