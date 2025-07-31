"use client";

import "./styles.css";

export interface HitProps {
  hit: {
    title: string;
    shortDescription: string;
    description: string;
    links: string[]; // Ruta(s) asociadas al proyecto (e.g., /es/projects/mi-proyecto)
    image?: string; // Imagen opcional
    // Algolia hit también puede tener un 'objectID'
    objectID: string; // Algolia ID, útil para enlaces permanentes
  };
}

function Hit({ hit }: HitProps) {
  const targetLink =
    hit.links && hit.links.length > 0
      ? hit.links[0]
      : `/es/projects/${hit.objectID}/`; // Fallback al objectID si links está vacío

  return (
    <a
      href={targetLink} // Usamos href para la navegación
      className="cursor-pointer flex flex-col sm:flex-row items-start bg-gray-100 dark:bg-gray-800 p-4 rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Imagen del proyecto */}
      <div className="image-container mb-2 mr-5 shrink-0 self-center">
        {hit.image ? (
          <img
            src={hit.image}
            alt={hit.title}
            className="w-full sm:w-32 h-32 object-cover rounded-sm"
          />
        ) : (
          <div className="flex items-center justify-center w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-sm">
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
        {/* Puedes añadir más detalles si los necesitas, como shortDescription */}
        {/* <p className="text-gray-700 dark:text-gray-300">{hit.shortDescription}</p> */}
      </div>
    </a>
  );
}

export default Hit;
