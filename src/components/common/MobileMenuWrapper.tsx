"use client";

import { useState, useEffect, useRef } from "react";
import ThemedToggleIconButton from "../themes/ThemedToggleIconButton.tsx";

interface MobileMenuWrapperProps {
  readonly lang?: "es" | "en";
}

export default function MobileMenuWrapper({
  lang = "es",
}: MobileMenuWrapperProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuWrapperRef = useRef<HTMLDivElement>(null);

  const texts = {
    es: {
      projects: "Proyectos",
      posts: "Posts",
      blogs: "Blogs",
      contact: "Contacto",
    },
    en: {
      projects: "Projects",
      posts: "Posts",
      blogs: "Blogs",
      contact: "Contact",
    },
  };

  const T = texts[lang];

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuWrapperRef.current &&
        !menuWrapperRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div ref={menuWrapperRef} className="flex">
      <div className="md:hidden">
        <button
          id="menuButton"
          className="text-white text-xl focus:outline-hidden pr-4 pl-4 pt-2 pb-2 transition duration-300 ease-in-out hover:text-blue-500"
          type="button"
          onClick={toggleMenu}
        >
          ☰
        </button>
      </div>

      <ul
        id="mobileMenu"
        className={`absolute z-1000 top-full right-0 items-center max-md:w-full bg-gray-900 md:px-4 list-none overflow-hidden md:static md:flex md:flex-row md:space-x-1 transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        } md:max-h-full`}
      >
        <li className="md:hidden">
          <a
            href={
              lang === "en" ? "/en/projects" : "/es/projects"
            }
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            {T.projects}
          </a>
        </li>
        <li className="md:hidden">
          <a
            href={
              lang === "en" ? "/en/posts" : "/es/posts"
            }
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            {T.posts}
          </a>
        </li>
        <li className="md:hidden">
          <a
            href={
              lang === "en" ? "/en/blogs" : "/es/blogs"
            }
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            {T.blogs}
          </a>
        </li>
        <li className="md:hidden">
          <a
            href={
              lang === "en" ? "/en/#contact" : "/#contact"
            }
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            {T.contact}
          </a>
        </li>
        <li className="flex items-center justify-center py-2">
          <ThemedToggleIconButton />
        </li>
      </ul>
    </div>
  );
}
