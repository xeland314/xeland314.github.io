import { CardHeader } from "./cardHeader";
import { CardFooter } from "./cardFooter";
import { IProjectInfo } from "./interfaces";

export default function SmallProjectCard({ project }: { project: IProjectInfo }) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      <div className="p-2">
        <CardHeader title={project.title} />
        <p className="text-gray-600 text-xs mb-1">{project.shortDescription}</p>
        <CardFooter githubLink={project.githubLink} demoLink={project.demoLink} />
      </div>
    </div>
  );
}
