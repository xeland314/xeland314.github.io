import { Github, Linkedin, Mail } from "../icons";

export default function Footer() {
  return (
    <footer className="py-6 md:py-8 bg-gray-800 text-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
          © 2023 xeland314. All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          <a href="https://github.com/xeland314" target="_blank" className="text-gray-400 hover:text-white transition-colors duration-300">
            <Github />
            <span className="sr-only">GitHub</span>
          </a>
          <a href="https://linkedin.com/in/christopher-villamarin" target="_blank" className="text-gray-400 hover:text-white transition-colors duration-300">
            <Linkedin />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a href="mailto:christopher.villamarin@protonmail.com" className="text-gray-400 hover:text-white transition-colors duration-300">
            <Mail />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
