import { Link } from "lucide-react";

interface ICardFooterProps {
  githubLink?: string;
  demoLink?: string;
}

export function CardFooter({ githubLink, demoLink }: ICardFooterProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 items-center justify-between gap-2 mt-4">
      {githubLink && (
        <a
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center justify-center bg-gray-500 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-sm"
        >
          <span className="mr-2">Repositorio</span>
          <img
            src="/icons/github.svg"
            alt="Github icon"
            height="20"
            width="20"
            style={{ filter: "invert(1)" }}
          />
        </a>
      )}
      {demoLink && (
        <a
          href={demoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-sm"
        >
          <span className="mr-2">Demo</span>
          <Link />
        </a>
      )}
    </div>
  );
}
