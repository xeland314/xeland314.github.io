import { Mail, Github, Linkedin } from "../icons";

export default function SocialNetworks() {
  return (
    <div className="flex items-center space-x-4">
      <a
        href="https://github.com/xeland314"
        target="_blank"
        rel="noopener"
        className="text-gray-400 hover:text-white transition-colors duration-300"
      >
        <Github />
        <span className="sr-only">GitHub</span>
      </a>
      <a
        href="https://linkedin.com/in/christopher-villamarin"
        target="_blank"
        rel="noopener"
        className="text-gray-400 hover:text-white transition-colors duration-300"
      >
        <Linkedin />
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
