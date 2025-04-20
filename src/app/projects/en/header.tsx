"use client";

import { Github, Link2Icon, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { projects } from "@/app/sections/projects/info";

export default function Header() {
  const pathname = usePathname();

  // Buscar el proyecto que tenga algún link coincidente con la ruta actual
  const project = projects.find((proj) =>
    proj.links?.some((link) => pathname.includes(link))
  );

  return (
    <header className="flex items-center justify-between bg-gray-200 dark:bg-gray-600 p-4 mb-4 rounded-sm">
      <a href="/projects" title="Go back to projects">
        <h1 className="flex flex-row items-center cursor-pointer text-lg font-bold  hover:text-blue-700 dark:hover:text-blue-500">
          <ArrowLeft size={24} className="mr-2" />
          Projects
        </h1>
      </a>
      <div className="flex gap-4">
        {project?.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
          >
            <Github
              className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              size={24}
            />
          </a>
        )}
        {project?.demoLink && (
          <a
            href={project.demoLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Demo"
          >
            <Link2Icon
              className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              size={24}
            />
          </a>
        )}
      </div>
    </header>
  );
}
