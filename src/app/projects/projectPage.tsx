import React from "react";
import { CardFooter } from "@/app/sections/projects/components/cardFooter";
import { IProjectInfo } from "@/app/sections/projects/components";
import { Badge } from "@/app/components";

export default function ProjectPageClient({
  projectData,
}: {
  projectData: IProjectInfo;
}) {
  return (
    <section id="proyecto" className="mx-4 p-4 mb-16">
      <h2 className="text-3xl font-bold mb-8">{projectData.title}</h2>
      {projectData.image && (
        <div className="flex flex-auto justify-center m-10">
          <img
            className="w-90 h-full object-cover mb-4 border-4 border-gray-300 rounded-lg shadow-lg"
            src={projectData.image}
            alt={projectData.title}
            loading="lazy"
          />
        </div>
      )}
      <p className="text-gray-600 text-sm mb-4">{projectData.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {projectData.tags.map((tag, index) => (
          <div key={index}>
            <Badge index={index} text={tag} />
          </div>
        ))}
      </div>
      <CardFooter
        githubLink={projectData.githubLink}
        demoLink={projectData.demoLink}
      />
    </section>
  );
}
