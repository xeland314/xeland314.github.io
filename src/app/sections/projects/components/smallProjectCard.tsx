import { CardHeader } from "./cardHeader";
import { CardFooter } from "./cardFooter";
import { IProjectInfo } from "./interfaces";
import { Badge, Tag } from "@/app/components";

export default function SmallProjectCard({
  project,
}: {
  project: IProjectInfo;
}) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden scrolldown-animation">
      <div className="p-4">
        <CardHeader title={project.title} />
        <p className="text-gray-600 dark:text-gray-300 text-xs mb-1">
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {project.tags.map((tag, index) => (
            <Badge index={index} text={tag} />
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
