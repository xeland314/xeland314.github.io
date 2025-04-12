import { Mail } from "lucide-react";

export default function SocialNetworks() {
  return (
    <div className="flex items-center space-x-4 bg-gray-900 p-4 rounded-xl gap-x-4">
      <a
        href="https://github.com/xeland314"
        target="_blank"
        rel="noopener"
        className="text-gray-400 hover:text-white transition-colors duration-300"
      >
        <img
          src="/icons/github.svg"
          alt="Github icon"
          height="20"
          width="20"
          style={{ filter: "invert(1)" }}
        />
        <span className="sr-only">GitHub</span>
      </a>
      <a
        href="https://linkedin.com/in/christopher-villamarin"
        target="_blank"
        rel="noopener"
        className="text-gray-400 hover:text-white transition-colors duration-300"
      >
        <img
          src="/icons/linkedin.svg"
          alt="Linkedin icon"
          height="20"
          width="20"
          style={{ filter: "invert(1)" }}
        />
        <span className="sr-only">LinkedIn</span>
      </a>
      <a
        href="mailto:christopher.villamarin@protonmail.com"
        className="text-gray-400 hover:text-white transition-colors duration-300"
      >
        <Mail />
        <span className="sr-only">Email</span>
      </a>
    </div>
  );
}
