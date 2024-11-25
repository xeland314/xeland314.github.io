import { Github, OpenLink } from "@/app/icons";

interface ICardFooterProps {
  githubLink?: string;
  demoLink?: string;
}

export function CardFooter({ githubLink, demoLink }: ICardFooterProps) {
  return (
    <div className="flex items-center max-sm:flex-col justify-between gap-2 mt-4">
      {githubLink && (
        <a
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
        >
          <span className="mr-2">Repositorio</span>
          <Github />
        </a>
      )}
      {demoLink && (
        <a
          href={demoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          <span className="mr-2">Demo</span>
          <OpenLink />
        </a>
      )}
    </div>
  );
}
