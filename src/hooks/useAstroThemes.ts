import { useState, useEffect } from "react";

import { ALL_THEMES, DEFAULT_THEME, type Theme } from "../scripts/themes/theme";

// Función auxiliar para obtener el tema actual del DOM.
// La separamos para que sea fácil de testear y usar.
function getResolvedThemeFromDOM(): Theme {
  const html = document.documentElement;
  let detectedTheme: Theme = DEFAULT_THEME; // Valor inicial por defecto

  // 1. Prioriza los temas explícitos en ALL_THEMES
  for (const themeClass of ALL_THEMES) {
    if (html.classList.contains(themeClass)) {
      detectedTheme = themeClass as Theme;
      return detectedTheme; // Si encontramos una coincidencia, esta es la más específica, la devolvemos inmediatamente
    }
  }

  // 2. Si no se encontró ningún tema explícito en ALL_THEMES,
  //    revisa el estado 'dark' vs 'light' implícito.
  if (html.classList.contains("dark")) {
    detectedTheme = "dark";
  } else {
    // Si no es 'dark' y no es ninguno de los ALL_THEMES, asumimos 'light'
    // Esto cubre el caso donde "light" no es una clase explícita, sino la ausencia de "dark" y otros.
    detectedTheme = "light";
  }

  return detectedTheme;
}

export const useAstroTheme = () => {
  // Inicializamos resolvedTheme con el tema actual del DOM
  // Esto asegura que el estado inicial sea correcto antes de que el observer actúe.
  const [resolvedTheme, setResolvedTheme] = useState<string>(() => getResolvedThemeFromDOM());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // El componente ya está montado en el cliente

    const updateTheme = () => {
      const currentDetectedTheme = getResolvedThemeFromDOM(); // Obtiene el tema actual del DOM

      // Solo actualiza el estado si el tema detectado es diferente al actual
      if (currentDetectedTheme !== resolvedTheme) {
        setResolvedTheme(currentDetectedTheme);
      }
    };

    // No necesitamos una llamada inicial a updateTheme() aquí
    // porque el useState ya se inicializa con getResolvedThemeFromDOM()

    // Configurar el MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Solo nos interesa si el atributo 'class' ha cambiado
        if (mutation.attributeName === 'class') {
          updateTheme(); // Re-evalúa el tema y actualiza el estado si es necesario
        }
      });
    });

    // Observar el elemento <html> para cambios en sus atributos (específicamente 'class')
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Función de limpieza para desconectar el observer cuando el componente se desmonte
    return () => {
      observer.disconnect();
    };
  }, [resolvedTheme]); // AGREGAR resolvedTheme como dependencia aquí

  return { resolvedTheme, mounted };
};