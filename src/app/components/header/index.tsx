"use client";

import { useState, useEffect, useRef } from "react";
import HeaderLink from "./link";
import { ThemeToggleButton } from "@/app/themes";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Escucha eventos de clic en toda la ventana
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Limpia el detector de eventos cuando el componente se desmonta
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 h-auto w-full bg-gray-800 text-white backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex justify-between items-center relative">
        <div className="basis-1/2 p-3 text-lg font-bold">
          <h1>
            <a href="/" className="hover:text-blue-700">
              xeland314
            </a>
          </h1>
        </div>
        <div className="md:hidden">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none pr-4 pl-4 pt-2 pb-2 transition duration-300 ease-in-out hover:bg-gray-700"
            type="button"
          >
            ☰
          </button>
        </div>
        <ul
          ref={menuRef}
          className={`absolute z-[1000] top-full left-0 items-center max-md:w-full bg-gray-800 md:px-4 list-none overflow-hidden md:static md:flex md:flex-row md:space-x-4 transition-all duration-300 ease-in-out ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <HeaderLink href="/#inicio" onClick={() => setIsOpen(!isOpen)}>
            Inicio
          </HeaderLink>
          <HeaderLink href="/#blogs" onClick={() => setIsOpen(!isOpen)}>
            Blogs
          </HeaderLink>
          <HeaderLink href="/#projects" onClick={() => setIsOpen(!isOpen)}>
            Proyectos
          </HeaderLink>
          <HeaderLink href="/#about-me" onClick={() => setIsOpen(!isOpen)}>
            Acerca de mí
          </HeaderLink>
          <div className="flex items-center justify-center py-2">
            <ThemeToggleButton />
          </div>
        </ul>
      </nav>
    </header>
  );
}
