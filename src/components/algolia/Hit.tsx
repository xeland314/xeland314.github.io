"use client";

import "./styles.css";

export interface HitProps {
  hit: {
    title: string;
    shortDescription: string;
    description: string;
    links: string[];
    image?: string;
    objectID: string;
    url?: string;
    path?: string;
    lang?: "es" | "en";
  };
}

function Hit({ hit }: HitProps) {
  const targetLink = hit.path || hit.url || hit.objectID;
  const lang = hit.lang || "es";

  const texts = {
    es: {
      no_image: "Sin Imagen",
    },
    en: {
      no_image: "No Image",
    },
  };

  const T = texts[lang];

  return (
    <a
      href={targetLink}
      className="cursor-pointer flex flex-col sm:flex-row items-start bg-gray-100 dark:bg-gray-800 p-4 rounded-sm shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="image-container mb-2 mr-5 shrink-0 self-center">
        {hit.image ? (
          <img
            src={hit.image}
            alt={hit.title}
            className="w-full sm:w-32 h-32 object-cover rounded-sm"
          />
        ) : (
          <div className="flex items-center justify-center w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-sm">
            <p className="text-gray-500 dark:text-gray-400">{T.no_image}</p>
          </div>
        )}
      </div>
      <div className="text-xs flex flex-col justify-center">
        <h3 className="font-bold mb-1 text-black dark:text-white">
          {hit.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300">{hit.description}</p>
      </div>
    </a>
  );
}

export default Hit;
