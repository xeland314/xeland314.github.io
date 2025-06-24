"use client";

import { useEffect, useState, useRef } from "react";
import ReadingProgress from "./readingProgress";
import TOCOptions from "./options";

interface Section {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const tocRef = useRef<HTMLDivElement>(null);
  const stickyTriggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configurar `IntersectionObserver` para detectar cuándo el TOC debe ser sticky
  useEffect(() => {
    if (!tocRef.current || !stickyTriggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => setIsSticky(!entries[0].isIntersecting),
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" }
    );

    observer.observe(stickyTriggerRef.current);
    return () => {
      if (stickyTriggerRef.current) {
        observer.unobserve(stickyTriggerRef.current);
      }
    };
  }, []);

  // Detectar la sección activa con `setTimeout` para evitar cambios bruscos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        if (visibleSections.length > 0) {
          const mostVisibleSection = visibleSections.sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          )[0].target.id;

          if (activeSection !== mostVisibleSection) {
            // Cancelar timeout previo para evitar cambios innecesarios
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            // Establecer un timeout para actualizar la sección activa después de un breve retraso
            timeoutRef.current = setTimeout(() => {
              setActiveSection(mostVisibleSection);
              history.replaceState(null, "", `#${mostVisibleSection}`);
            }, 200);
          }
        }
      },
      {
        rootMargin: "-10% 0px -70% 0px",
        threshold: Array.from({ length: 10 }, (_, i) => i / 10),
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () =>
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) observer.unobserve(element);
      });
  }, [sections, activeSection]);

  // **Cerrar TOC al hacer clic fuera de él**
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div ref={stickyTriggerRef} className="h-1 w-full" />

      <div
        ref={tocRef}
        className={`flex flex-col left-0 w-full transition-all duration-300 ${
          isSticky
            ? "fixed top-16 z-50 bg-white dark:bg-gray-900 shadow-md py-1 px-8"
            : ""
        }`}
      >
        <TOCOptions
          sections={sections}
          activeSection={activeSection}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
        <ReadingProgress />
      </div>
    </>
  );
}
