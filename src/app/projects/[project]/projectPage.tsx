
"use client";
import React from "react";
import { CardFooter } from "@/app/sections/projects/components/cardFooter";
import { IProjectInfo } from "@/app/sections/projects/components";

export default function ProjectPageClient({ projectData }: {projectData: IProjectInfo}) {
  return (
    <section id="proyecto" className="mb-16">
      <h2 className="text-3xl font-bold mb-8">{projectData.title}</h2>
      {projectData.image && (
        <img
          className="w-full h-48 object-cover mb-4"
          src={projectData.image}
          alt={projectData.title}
        />
      )}
      <p className="text-gray-600 text-sm mb-4">{projectData.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {projectData.tags.map((tag) => (
          <span
            key={tag}
            className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      <CardFooter
        githubLink={projectData.githubLink}
        demoLink={projectData.demoLink}
      />
    </section>
  );
}
