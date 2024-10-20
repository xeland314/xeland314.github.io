"use client";

import { useState } from "react";
import HeaderLink from "./link";
import { ThemeToggleButton } from "@/app/themes";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-gray-800 text-white fixed top-0">
      <nav className="flex justify-between items-center relative">
        <div className="basis-1/2 p-3 text-lg font-bold">
          <h1>
            <a href="/">xeland314</a>
          </h1>
        </div>
        <div className="sm:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none pr-4 pl-4 pt-2 pb-2 transition duration-300 ease-in-out hover:bg-gray-700"
            type="button"
          >
            ☰
          </button>
        </div>
        <ul
          className={`absolute z-[1000] top-full left-0 items-center max-sm:w-full bg-gray-800 sm:px-4 list-none overflow-hidden sm:static sm:flex sm:flex-row sm:space-x-4 transition-all duration-300 ease-in-out ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <HeaderLink href="/#inicio" onClick={() => setIsOpen(!isOpen)}>
            Inicio
          </HeaderLink>
          <HeaderLink href="/#blogs" onClick={() => setIsOpen(!isOpen)}>
            Blogs
          </HeaderLink>
          <HeaderLink href="/#proyectos" onClick={() => setIsOpen(!isOpen)}>
            Proyectos
          </HeaderLink>
          <HeaderLink href="/#acerca-de-mi" onClick={() => setIsOpen(!isOpen)}>
            Acerca de mí
          </HeaderLink>
          <div
            className="flex items-center justify-center py-2"
          >
            <ThemeToggleButton />
          </div>
        </ul>
      </nav>
    </header>
  );
}
