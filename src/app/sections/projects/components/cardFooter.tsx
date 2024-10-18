import { Github, OpenLink } from "@/app/icons";

interface ICardFooterProps {
  githubLink?: string;
  demoLink?: string;
}

export function CardFooter({ githubLink, demoLink }: ICardFooterProps) {
  return (
    <div className="flex gap-2 mt-4">
      {githubLink && (
        <a
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <span className="mr-2">Repo</span>
          <Github />
        </a>
      )}
      {demoLink && (
        <a
          href={demoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          <span className="mr-2">Demo</span>
          <OpenLink />
        </a>
      )}
    </div>
  );
}
