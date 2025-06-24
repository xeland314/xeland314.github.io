"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY; // Posición actual del scroll
      const windowHeight = window.innerHeight; // Altura visible del viewport
      const docHeight = document.documentElement.scrollHeight; // Altura total del documento

      // Calcular el área realmente desplazable en la página
      const headerHeight = 130;
      const footerHeight = 195;
      const totalScrollable = Math.max(docHeight - windowHeight - headerHeight - footerHeight, 0);

      // Limitar el progreso para que nunca exceda 100%
      const newProgress = totalScrollable > 0 ? (scrollY / totalScrollable) * 100 : 0;
      setProgress(Math.min(newProgress, 100.0));
    };

    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
      <div
        className="h-1 bg-blue-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
