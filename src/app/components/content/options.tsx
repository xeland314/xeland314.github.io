"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface TOCOptionsProps {
  sections: Section[];
  activeSection: string | null;
  isExpanded?: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
}

export default function TOCOptions({
  sections,
  activeSection,
  isExpanded,
  setIsExpanded,
}: TOCOptionsProps) {
  const handleSmoothScroll = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    event.preventDefault();
    const targetElement = document.getElementById(sectionId);

    if (targetElement) {
      const headerOffset = 130;
      const offsetPosition =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });

      // Espera a que termine el desplazamiento antes de actualizar la URL
      setTimeout(() => {
        history.replaceState(null, "", `#${sectionId}`);
      }, 500);
    }
  };

  const activeSectionTitle =
    sections.find((section) => section.id === activeSection)?.title ||
    "Contenido del artículo"; // Valor por defecto

  return (
    <div
      className="w-full cursor-pointer px-1 rounded-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-baseline">
        {isExpanded ? (
          <ChevronUp size={20} className="mr-2 text-gray-600 dark:text-gray-400" />
        ) : (
          <ChevronDown size={20} className="mr-2 text-gray-600 dark:text-gray-400" />
        )}
        <h4 className="font-bold text-gray-800 dark:text-gray-200">
          {activeSectionTitle}
        </h4>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden mb-1 ${
          isExpanded ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="space-y-1">
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={`block p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-800 ${
                    activeSection === section.id
                      ? "bg-blue-500 text-white font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={(event) => handleSmoothScroll(event, section.id)}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
