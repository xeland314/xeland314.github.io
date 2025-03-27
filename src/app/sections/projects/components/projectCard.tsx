import { CardHeader } from "./cardHeader";
import { CardFooter } from "./cardFooter";
import { IProjectInfo } from "./interfaces";
import { Badge } from "@/app/components";

export default function ProjectCard({ project }: { project: IProjectInfo }) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden h-auto scrolldown-animation-2">
      {project.image && (
        <div className="flex flex-auto justify-center bg-transparent">
          <img
            className="w-auto h-48 object-cover"
            src={project.image}
            alt={project.title}
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4">
        <CardHeader title={project.title} />
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tags.map((tag, index) => (
            <div key={index}>
              <Badge index={index} text={tag} />
            </div>
          ))}
        </div>
        <CardFooter
          githubLink={project.githubLink}
          demoLink={project.demoLink}
        />
      </div>
    </div>
  );
}
