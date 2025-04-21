"use client";

import { useState, useEffect, useRef } from "react";
import HeaderLink from "./link";
import { ThemeToggleButton } from "@/app/themes";
import Search from "../algolia/search";
import { Search as SearchIcon, X } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null); // Nueva referencia para el botón de búsqueda

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cierra el menú si el clic ocurre fuera del menú y el botón del menú
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }

      // Cierra la barra de búsqueda si el clic ocurre fuera del área de búsqueda y el botón de búsqueda
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target as Node)
      ) {
        setIsSearchVisible(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 h-auto w-full bg-gray-900 text-white backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <nav className="flex justify-between items-center relative p-3">
        <div className="flex items-center">
          <a href="/" className="text-lg font-bold hover:text-blue-500">
            xeland314
          </a>
        </div>

        {/* Botón de búsqueda */}
        <button
          ref={searchButtonRef} // Añadimos la referencia
          onClick={() => setIsSearchVisible(!isSearchVisible)}
          className="text-white hover:text-blue-500 ml-auto"
          aria-label={isSearchVisible ? "Cerrar búsqueda" : "Abrir búsqueda"}
        >
          {isSearchVisible ? (
            <X size={24} aria-label="Cerrar barra de búsqueda" />
          ) : (
            <SearchIcon size={24} aria-label="Search" />
          )}
        </button>

        <div className="md:hidden">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-hidden pr-4 pl-4 pt-2 pb-2 transition duration-300 ease-in-out hover:bg-gray-700"
            type="button"
          >
            ☰
          </button>
        </div>

        <ul
          ref={menuRef}
          className={`absolute z-1000 top-full left-0 items-center max-md:w-full bg-gray-900 md:px-4 list-none overflow-hidden md:static md:flex md:flex-row md:space-x-4 transition-all duration-300 ease-in-out ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <HeaderLink href="/#blogs" onClick={() => setIsOpen(false)}>
            Blogs
          </HeaderLink>
          <HeaderLink href="/#projects" onClick={() => setIsOpen(false)}>
            Proyectos
          </HeaderLink>
          <HeaderLink href="/#about-me" onClick={() => setIsOpen(false)}>
            Acerca de mí
          </HeaderLink>
          <div className="flex items-center justify-center py-2">
            <ThemeToggleButton />
          </div>
        </ul>
      </nav>

      {/* Componente de búsqueda */}
      {isSearchVisible && (
        <div
          ref={searchRef}
          className="w-full lg:w-1/2 absolute top-full left-1/2 transform -translate-x-1/2 z-40 bg-gray-900 text-white p-4 shadow-lg"
        >
          <Search />
        </div>
      )}
    </header>
  );
}
