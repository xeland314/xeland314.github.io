import { CardHeader } from "./cardHeader";
import { CardFooter } from "./cardFooter";
import { IProjectInfo } from "./interfaces";
import { Badge } from "@/app/components";

export default function ProjectCard({ project }: { project: IProjectInfo }) {
  return (
    <div className="rounded-lg shadow-lg overflow-hidden h-auto scrolldown-animation-2 bg-gray-200 dark:bg-gray-700">
      <div className="flex flex-auto justify-center bg-transparent h-48">
        {project.image ? (
          <img
            className="w-auto h-48 object-cover"
            src={project.image}
            alt={project.title}
            loading="lazy"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            viewBox="0 0 500 150"
          >
            <rect width="100%" height="100%" fill="#111827" />
            <text
              x="50%"
              y="50%"
              fontSize="24"
              fontFamily="Arial, sans-serif"
              fill="#FFFFFF"
              textAnchor="middle"
              alignmentBaseline="central"
              color="white"
            >
              {project.title}
            </text>
          </svg>
        )}
      </div>
      <div className="p-4">
        <CardHeader title={project.title} link={project.links?.[0] || ""} />
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
