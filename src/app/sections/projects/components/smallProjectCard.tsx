import { CardHeader } from "./cardHeader";
import { CardFooter } from "./cardFooter";
import { IProjectInfo } from "./interfaces";

export default function SmallProjectCard({ project }: { project: IProjectInfo }) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <CardHeader title={project.title} />
        <p className="text-gray-600 text-xs mb-1">{project.shortDescription}</p>
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
        <CardFooter githubLink={project.githubLink} demoLink={project.demoLink} />
      </div>
    </div>
  );
}
