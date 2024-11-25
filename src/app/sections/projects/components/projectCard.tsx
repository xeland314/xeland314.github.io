import { CardHeader } from "./cardHeader";
import { CardFooter } from "./cardFooter";
import { IProjectInfo } from "./interfaces";

export default function ProjectCard({ project }: { project: IProjectInfo }) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden h-auto scrolldown-animation-2">
      {project.image && (
        <div className="flex flex-auto justify-center">
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
        <p className="text-gray-600 text-sm mb-2">{project.shortDescription}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs"
            >
              {tag}
            </span>
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
