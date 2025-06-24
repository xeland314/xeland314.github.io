export const code = `"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemedImageProps {
  srcForLight: string;
  srcForDark: string;
  alt: string;
  width?: string;
  height?: string;
}

const ThemedImage: React.FC<ThemedImageProps> = ({
  srcForLight,
  srcForDark,
  alt,
  width,
  height,
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const src = resolvedTheme === "dark" ? srcForDark : srcForLight;

  return <img src={src} alt={alt} width={width} height={height} loading="lazy" />;
};

export default ThemedImage;`;

export const code_2 = `import { useState, useEffect } from "react";

const availableThemes = ["light", "dark", "blue", "orange", "green"];

const useTheme = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Detectar modo oscuro del sistema en la primera carga
    const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemTheme = darkModeMediaQuery.matches ? "dark" : "light";

    // Cargar el tema desde localStorage o usar el detectado
    const storedTheme = localStorage.getItem("theme");
    setTheme(storedTheme && availableThemes.includes(storedTheme) ? storedTheme : systemTheme);

    // Actualizar tema cuando el sistema cambia
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "light" || theme === "dark") {
        setTheme(e.matches ? "dark" : "light");
        localStorage.setItem("theme", e.matches ? "dark" : "light");
      }
    };
    darkModeMediaQuery.addEventListener("change", handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Función para cambiar el tema
  const changeTheme = (newTheme: string) => {
    if (availableThemes.includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  return { resolvedTheme: theme, setTheme: changeTheme };
};

export default useTheme;`;

export const code_3 = `<ThemedImage
  srcForLight={"/paisaje-nevado.png"}
  srcForDark={"/mercado-navideño.png"}
  alt={"Ejemplo"}
  width={"300"}
  height={"300"}
/>`;

export const code_4 = `@import 'tailwindcss';

@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));`;

export const code_5 = `@import 'tailwindcss';

@custom-variant dark (&:where([data-mode="dark"], [data-mode="dark"] *));
@custom-variant blue (&:where([data-mode="blue"], [data-mode="blue"] *));
@custom-variant orange (&:where([data-mode="orange"], [data-mode="orange"] *));
@custom-variant green (&:where([data-mode="green"], [data-mode="green"] *));`;

export const code_6 = `"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ImageThemeProps {
  src: string;
  theme: string;
}

interface ThemedImageProps {
  srcForLight: string;
  srcForDark: string;
  alt: string;
  width?: string;
  height?: string;
  otherThemes?: ImageThemeProps[];
}

const ThemedImage: React.FC<ThemedImageProps> = ({
  srcForLight,
  srcForDark,
  alt,
  width,
  height,
  otherThemes = [],
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Buscar un tema adicional en el array otherThemes
  const matchedTheme = otherThemes.find((theme) => theme.theme === resolvedTheme);

  // Definir la imagen según el tema activo
  const src = matchedTheme?.src || (resolvedTheme === "dark" ? srcForDark : srcForLight);

  return <img src={src} alt={alt} width={width} height={height} loading="lazy" />;
};

export default ThemedImage;
`;