"use client";

import { InstantSearch, SearchBox, Hits } from "react-instantsearch";
import Hit, { type HitProps } from "./Hit";
import searchClient from "./searchClient";
import { useEffect, useRef, useState } from "react";

export function AlgoliaSearchComponent() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="projects"
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <div className="mx-auto px-4 pb-4">
        <div className="flex flex-row items-center justify-between">
          <SearchBox
            className="mb-4 w-full text-black dark:text-white sm:gap-x-1"
            placeholder="Buscar proyectos..."
          />
        </div>
        <div className="h-[50vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-sm shadow-inner">
          <Hits<HitProps["hit"]> hitComponent={Hit} />
        </div>
      </div>
    </InstantSearch>
  );
}

export default function SearchbarWrapper() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleSearch = () => {
    setIsSearchVisible((prev) => !prev);
  };

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchVisible(false);
      }
    };

    if (isSearchVisible) {
      // Enfocar el input de búsqueda cuando la barra se hace visible
      // Usamos un pequeño timeout para asegurar que el componente esté renderizado
      setTimeout(() => {
        const searchInput = wrapperRef.current?.querySelector(
          ".ais-SearchBox-input"
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 0);

      document.addEventListener("keydown", handleEscapeKey);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchVisible]);

  return (
    <div ref={wrapperRef} className="flex">
      <button
        type="button"
        id="searchButton"
        // La clave es `relative` y `p-2` para dar espacio
        className="relative flex items-center justify-center text-white hover:text-blue-500 py-2 px-3"
        aria-label="Abrir búsqueda"
        onClick={toggleSearch}
      >
        {/* Ícono de búsqueda */}
        <svg
          // Ambos iconos son `absolute` para superponerlos
          className={`absolute inset-0 w-6 h-6 m-auto transition-opacity duration-300 ${
            isSearchVisible ? "opacity-0" : "opacity-100"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        {/* Ícono de cerrar */}
        <svg
          // También es `absolute`, superponiéndose al anterior
          className={`absolute inset-0 w-6 h-6 m-auto transition-opacity duration-300 ${
            isSearchVisible ? "opacity-100" : "opacity-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>

      {isSearchVisible && (
        <div
          id="searchBar"
          className="w-full lg:w-1/2 absolute top-full left-1/2 transform -translate-x-1/2 z-100 bg-gray-900 text-white p-4 shadow-lg rounded-b-2xl"
        >
          <AlgoliaSearchComponent />
        </div>
      )}
    </div>
  );
}
