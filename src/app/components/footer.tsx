import { Github, Linkedin, Mail } from "../icons";
import SocialNetworks from "./socialNetworks";

export default function Footer() {
  return (
    <footer className="py-6 md:py-0 px-10 bg-gray-800 text-white bottom-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
          © 2023 xeland314. All rights reserved.
        </p>
          <SocialNetworks/>
      </div>
    </footer>
  );
}
