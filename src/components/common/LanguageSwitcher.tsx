"use client";

import { useState, useEffect } from "react";

interface LanguageSwitcherProps {
  dynamic?: boolean;
}

const LanguageSwitcher = ({ dynamic = false }: LanguageSwitcherProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [otherLangUrl, setOtherLangUrl] = useState("");
  const [currentLang, setCurrentLang] = useState("");
  const [otherLang, setOtherLang] = useState("");
  const [isValidRoute, setIsValidRoute] = useState(true);

  useEffect(() => {
    const path = window.location.pathname;
    // Obtener el fragmento (hash) de la URL, si existe. Ejemplo: '#contact'
    const hash = window.location.hash;

    // Identificar el idioma actual basado en los prefijos
    const isEnglish = path.startsWith("/en");
    const isSpanishExplicit = path.startsWith("/es");

    // Determinar el idioma actual y el opuesto
    let currentLanguage = "";
    let otherLanguage = "";

    // Lógica de Validación: La ruta DEBE ser /, /en/<route>, o /es/<route>
    const isRoot = path === "/";

    if (isEnglish) {
      currentLanguage = "en";
      otherLanguage = "es";
    } else if (isSpanishExplicit || isRoot) {
      // La raíz / o /es/... es ES
      currentLanguage = "es";
      otherLanguage = "en";
    } else {
      // Cualquier otra ruta que no sea / ni tenga prefijo (/about) se considera no cubierta
      console.warn(`Ruta no válida para el Language Switcher: ${path}`);
      setIsValidRoute(false);
      setIsMounted(true);
      return;
    }

    setCurrentLang(currentLanguage);
    setOtherLang(otherLanguage);

    // La URL actual para el <select> es solo el pathname.
    // El hash no se incluye aquí para la lógica de opciones, pero SÍ en el `otherUrl`
    setCurrentUrl(path);

    let otherPath;

    if (currentLanguage === "en") {
      // De Inglés a Español

      if (path === "/en" || path === "/en/") {
        // 1. De /en a /
        otherPath = "/";
      } else {
        // 3. De /en/<any route> a /es/<any route>
        // Incluye el caso de /en/#<section> que entra aquí con path=/en
        otherPath = path.replace("/en", "/es");
      }
    } else {
      // De Español a Inglés

      if (isRoot) {
        // 1. De / a /en
        // 2. De /#<section> (path = /) a /en/#<section>
        otherPath = "/en";
      } else {
        // 3. De /es/<any route> a /en/<any route>
        otherPath = path.replace("/es", "/en");
      }
    }

    // COMBINAR: Asegurar que el hash se añada a la URL de destino
    setOtherLangUrl(otherPath + hash);

    setIsMounted(true);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Usamos el valor completo de la opción, que ya incluye el hash
    window.location.assign(e.target.value);
  };

  // Oculta el selector si la ruta no está cubierta
  if (!isMounted || !isValidRoute) {
    if (!isMounted) {
      return (
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
      );
    }
    return null;
  }

  // Se definen las clases dinámicas
  // Si dynamic es true: fondo transparente, texto gris que cambia a blanco en dark mode.
  // Si dynamic es false: mantiene tu estilo original (fondo oscuro, texto blanco).
  const selectClasses = dynamic
    ? "bg-transparent text-gray-600 dark:text-gray-400 cursor-pointer focus:outline-none"
    : "bg-gray-900 text-white rounded-md p-2 cursor-pointer";

  return (
    <div className="relative inline-block">
      <select
        value={currentUrl}
        onChange={handleLanguageChange}
        className={`${selectClasses} appearance-none uppercase text-sm font-thin`}
        aria-label="Change language"
      >
        <option value={currentUrl} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          {currentLang}
        </option>
        <option value={otherLangUrl} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          {otherLang}
        </option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
