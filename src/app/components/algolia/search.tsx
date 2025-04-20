"use client";

import { InstantSearch, SearchBox, Hits } from "react-instantsearch-hooks-web";
import { useRouter } from "next/navigation";
import searchClient from "./api";
import "./styles.css";

interface HitProps {
  hit: {
    title: string;
    shortDescription: string;
    description: string;
    links: string[]; // Ruta(s) asociadas al proyecto
    image?: string; // Imagen opcional
  };
}

function Hit({ hit }: HitProps) {
  const router = useRouter(); // Manejar navegación dinámica

  const handleNavigation = () => {
    if (hit.links.length > 0) {
      router.push(hit.links[0]); // Redirigir a la primera ruta asociada
    }
  };

  return (
    <div
      onClick={handleNavigation}
      className="cursor-pointer flex flex-col sm:flex-row items-start bg-gray-100 dark:bg-gray-800 p-4 rounded shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Imagen del proyecto */}
      <div className="image-container mb-2 mr-5 flex-shrink-0 self-center">
        {hit.image ? (
          <img
            src={hit.image}
            alt={hit.title}
            className="w-full sm:w-32 h-32 object-cover rounded" // Dimensiones fijas
          />
        ) : (
          <div className="flex items-center justify-center w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded">
            <p className="text-gray-500 dark:text-gray-400">No Image</p>
          </div>
        )}
      </div>
      {/* Información del proyecto */}
      <div className="text-xs flex flex-col justify-center">
        <h3 className="font-bold mb-1 text-black dark:text-white">
          {hit.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{hit.description}</p>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <InstantSearch searchClient={searchClient} indexName="projects">
      <div className="mx-auto px-4 pb-4">
        {/* Cabecera de la búsqueda */}
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl font-bold mb-4 hidden sm:block">Search:</h1>
          <SearchBox
            className="mb-4 w-full text-black dark:text-white sm:gap-x-1"
            placeholder="Search for projects..."

          />
        </div>

        {/* Contenedor de resultados con scroll independiente */}
        <div className="h-[50vh] overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded shadow-inner">
          <Hits<HitProps["hit"]> hitComponent={Hit} />
        </div>
      </div>
    </InstantSearch>
  );
}
