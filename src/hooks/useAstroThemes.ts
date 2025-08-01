import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "blue" | "orange" | "green" | string;
const ALL_THEMES: Theme[] = ["dark", "blue", "orange", "green", "light"];
const DEFAULT_THEME: Theme = "dark";

// Función auxiliar para obtener el tema actual del DOM.
// NO debe ejecutarse directamente al inicializar el módulo.
function getResolvedThemeFromDOM(): Theme {
  // Asegurarse de que document existe antes de intentar acceder a él
  if (typeof document === "undefined") {
    return DEFAULT_THEME; // O el valor que consideres seguro para el servidor
  }

  const html = document.documentElement;
  let detectedTheme: Theme = DEFAULT_THEME;

  for (const themeClass of ALL_THEMES) {
    if (html.classList.contains(themeClass)) {
      detectedTheme = themeClass as Theme;
      return detectedTheme;
    }
  }

  if (html.classList.contains("dark")) {
    detectedTheme = "dark";
  } else {
    detectedTheme = "light";
  }

  return detectedTheme;
}

export const useAstroTheme = () => {
  // Inicializamos resolvedTheme con un valor por defecto (ej. DEFAULT_THEME o 'light')
  // No llamamos a getResolvedThemeFromDOM() aquí directamente.
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(DEFAULT_THEME); // Inicializa con un valor seguro
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Inicializa el tema solo si estamos en el cliente
    if (typeof document !== "undefined") {
      const initialTheme = getResolvedThemeFromDOM();
      setResolvedTheme(initialTheme);
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Usamos la forma funcional de `setResolvedTheme` para obtener el `prevTheme`
          // y compararlo con el `currentDetectedTheme`.
          setResolvedTheme((prevTheme) => {
            const currentDetectedTheme = getResolvedThemeFromDOM();
            if (currentDetectedTheme !== prevTheme) {
              return currentDetectedTheme;
            }
            return prevTheme; // No cambia si el tema es el mismo
          });
        }
      });
    });

    if (typeof document !== "undefined") {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      if (typeof document !== "undefined") {
        observer.disconnect();
      }
    };
  }, []); // Dependencia vacía

  return { resolvedTheme, mounted };
};
