"use client";

import React, { useState } from "react";
import { projects } from "../sections/projects/info";
import { ProjectCard } from "../sections/projects/components";
import Pagination from "./pagination";

const ITEMS_PER_PAGE = 6;

export default function ProjectsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const currentProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section id="projects" className="mb-16">
      <h2 className="text-3xl text-center font-bold pb-4">
        <a
          href="/projects"
          className="hover:text-blue-700 font-bold py-2 px-4 rounded-sm"
        >
          Proyectos
        </a>
      </h2>
      <hr className="pb-[1px] mb-4 scrolldown-animation-2 bg-gray-800 dark:bg-white" />
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
