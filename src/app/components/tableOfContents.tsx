"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}
export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const tocRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const stickyObserverRef = useRef<IntersectionObserver | null>(null);
  const stickyTriggerRef = useRef<HTMLDivElement>(null);

  // Configurar el IntersectionObserver para detectar cuándo el TOC debe ser sticky
  useEffect(() => {
    if (!tocRef.current || !stickyTriggerRef.current) return;

    const options = {
      threshold: 0,
      rootMargin: "-1px 0px 0px 0px", // Hacer sticky justo cuando el borde superior toca el viewport
    };

    stickyObserverRef.current = new IntersectionObserver((entries) => {
      // Cuando el trigger sale de la vista, activar el modo sticky
      setIsSticky(!entries[0].isIntersecting);
    }, options);

    stickyObserverRef.current.observe(stickyTriggerRef.current);

    return () => {
      if (stickyObserverRef.current && stickyTriggerRef.current) {
        stickyObserverRef.current.unobserve(stickyTriggerRef.current);
      }
    };
  }, []);

  // Manejador de clics fuera del componente para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tocRef.current &&
        !tocRef.current.contains(event.target as Node) &&
        isExpanded
      ) {
        setIsExpanded(false);
      }
    };

    // Añadir event listener para detectar clics fuera del componente
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    // Función para manejar el desplazamiento suave de manera más precisa
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" &&
        target.getAttribute("href")?.startsWith("#")
      ) {
        e.preventDefault();
        const targetId = target.getAttribute("href")?.substring(1);
        const targetElement = document.getElementById(targetId!);

        if (targetElement) {
          // Calcular la posición de destino, teniendo en cuenta cualquier encabezado fijo
          const offset = 350; // Ajusta según sea necesario
          const scrollPosition =
            targetElement.getBoundingClientRect().top + window.scrollY - offset;

          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });

          // Actualiza la URL sin recargar la página
          history.pushState(null, "", `#${targetId}`);

          // Actualiza la sección activa
          setActiveSection(targetId ?? null);
        }
      }
    };

    // Función mejorada para observar qué sección está visible
    const setupSectionObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          // Filtra las entradas que están intersectando
          const visibleEntries = entries.filter(
            (entry) => entry.isIntersecting
          );

          if (visibleEntries.length > 0) {
            // Ordena por ratio de intersección para elegir la más visible
            visibleEntries.sort(
              (a, b) => b.intersectionRatio - a.intersectionRatio
            );
            const mostVisibleSection = visibleEntries[0].target.id;

            // Solo actualiza si es diferente para reducir renders
            if (activeSection !== mostVisibleSection) {
              setActiveSection(mostVisibleSection);

              // Actualiza la URL si el usuario ha terminado de desplazarse
              const updateUrl = () => {
                if (!window.location.hash.includes(mostVisibleSection)) {
                  history.replaceState(null, "", `#${mostVisibleSection}`);
                }
              };

              // Usa un pequeño retraso para evitar actualizaciones frecuentes durante el scroll
              setTimeout(updateUrl, 100);
            }
          }
        },
        {
          rootMargin: "-10% 0px -70% 0px", // Zona central del viewport
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Más umbrales para mejor precisión
        }
      );

      // Observa cada sección
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.observe(element);
        }
      });

      return () => {
        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element) {
            observer.unobserve(element);
          }
        });
      };
    };

    // Añadir los event listeners
    document.addEventListener("click", handleLinkClick);
    const cleanupSectionObserver = setupSectionObserver();

    // Detección inicial de sección activa
    const initialSection = sections.find(
      (section) => window.location.hash === `#${section.id}`
    );

    if (initialSection) {
      setActiveSection(initialSection.id);

      // Mejorado el desplazamiento inicial con un pequeño retraso
      setTimeout(() => {
        const targetElement = document.getElementById(initialSection.id);
        if (targetElement) {
          const scrollPosition =
            targetElement.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }, 200); // Aumentado ligeramente el retraso para asegurar renderizado completo
    } else if (sections.length > 0) {
      setActiveSection(sections[0].id);
    }

    return () => {
      document.removeEventListener("click", handleLinkClick);
      cleanupSectionObserver();
    };
  }, [sections, activeSection]); // Añadido activeSection a las dependencias

  // Expandir automáticamente cuando cambia a sticky, colapsar cuando vuelve a normal
  useEffect(() => {
    if (isSticky) {
      setIsExpanded(false); // Colapsar cuando se vuelve sticky
    }
  }, [isSticky]);

  return (
    <>
      {/* Elemento invisible que sirve como trigger para el observer */}
      <div ref={stickyTriggerRef} className="h-1 w-full" />

      <div
        ref={tocRef}
        className={`w-full left-0 transition-all duration-300 ${
          isSticky
            ? "fixed lg:w-1/2 lg:left-1/4 top-16 z-100 bg-white dark:bg-gray-900 shadow-md py-1 px-8"
            : ""
        }`}
      >
        <div
          className="w-full flex flex-row justify-between cursor-pointer px-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          onClick={(e) => {
            e.stopPropagation(); // Evita propagación del evento
            setIsExpanded(!isExpanded);
          }}
          aria-expanded={isExpanded}
          role="button"
          tabIndex={0}
          aria-label={isExpanded ? "Colapsar índice" : "Expandir índice"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <h3 className="font-bold text-gray-800 dark:text-gray-200">
            Contenido del artículo
          </h3>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown
              size={20}
              className="text-gray-600 dark:text-gray-400"
            />
          )}
        </div>

        <div
          className={`w-full overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="space-y-1" aria-label="Tabla de contenidos">
            <ul className="list-none">
              {sections.map((section) => (
                <li key={section.id} className="my-1">
                  <a
                    href={`#${section.id}`}
                    className={`block p-2 rounded-md transition-colors duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-500 text-white font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                    aria-current={
                      activeSection === section.id ? "page" : undefined
                    }
                    onClick={(e) => {
                      // Si está en modo sticky, cerrar después de clicar
                      if (isSticky) {
                        setTimeout(() => setIsExpanded(false), 300);
                      }
                    }}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

          <div
            className={`readingProgress`}
            style={{
              width: `${calculateReadingProgress(activeSection, sections)}%`,
            }}
            role="progressbar"
            aria-valuenow={Math.round(calculateReadingProgress(activeSection, sections)) || 0}
            aria-valuemin={0}
            aria-valuemax={100}
            title="Progreso de lectura"
          />
        </div>
    </>
  );
}

// Función para calcular el progreso de lectura basado en la sección activa
function calculateReadingProgress(
  activeSection: string | null,
  sections: Section[]
) {
  if (!activeSection || sections.length === 0) return 0;

  const activeIndex = sections.findIndex(
    (section) => section.id === activeSection
  );
  if (activeIndex === -1) return 0;

  // Calcular progreso como porcentaje basado en la sección actual
  return ((activeIndex + 1) / sections.length) * 100;
}
