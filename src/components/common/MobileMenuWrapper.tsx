"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggleButton from "../themes/ThemeToggleButton.tsx";

export default function MobileMenuWrapper() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuWrapperRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica si el clic ocurrió fuera del contenedor del menú y del botón
      if (
        menuWrapperRef.current &&
        !menuWrapperRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Agregar el listener solo cuando el menú está abierto para optimizar el rendimiento
    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    // Limpiar el listener al cerrar el menú o al desmontar el componente
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    // Usa `ref` para el contenedor para poder detectar clics fuera de él
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
        // Clases de Tailwind CSS para gestionar la visibilidad y transición del menú
        className={`absolute z-1000 top-full right-0 items-center max-md:w-full bg-gray-900 md:px-4 list-none overflow-hidden md:static md:flex md:flex-row md:space-x-1 transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        } md:max-h-full`}
      >
        <li>
          <a
            href="/#about-me"
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en un enlace
          >
            Acerca de mí
          </a>
        </li>
        <li>
          <a
            href="/#projects"
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en un enlace
          >
            Proyectos
          </a>
        </li>
        <li>
          <a
            href="/#certificates"
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Certificados
          </a>
        </li>
        <li>
          <a
            href="/#contact"
            className="block p-2 hover:bg-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Contáctame
          </a>
        </li>
        <li className="flex items-center justify-center py-2">
          <ThemeToggleButton />
        </li>
      </ul>
    </div>
  );
}
