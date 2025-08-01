"use client";

import { useState, useEffect } from "react";

export default function ThemeToggleButton() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // 1. Leer la preferencia del tema al montar el componente
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // 2. Establecer el estado inicial
    const initialThemeIsDark =
      storedTheme === "dark" || (!storedTheme && systemPrefersDark);
    setIsDark(initialThemeIsDark);

    // 3. Aplicar la clase 'dark' al elemento html
    if (initialThemeIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Guardar la nueva preferencia en localStorage
    localStorage.setItem("theme", newIsDark ? "dark" : "light");

    // Aplicar o remover la clase 'dark' en el elemento html
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        className="sr-only"
        aria-label="Toggle dark mode"
      />
      <div
        className="w-11 h-6 bg-gray-200 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
          relative flex items-center transition-colors dark:bg-gray-700"
      >
        {/* Moon Icon */}
        <div
          className={`absolute left-1 transition-opacity duration-300 ${
            !isDark ? "opacity-0 translate-x-100" : "opacity-100 translate-x-0"
          }`}
        >
          <svg
            id="moonIcon"
            className="w-4 h-4 text-gray-500 dark:text-gray-100 transition-opacity opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            ></path>
          </svg>
        </div>
        {/* Sun Icon */}
        <div
          className={`absolute right-1 transition-opacity duration-300 ${
            !isDark ? "opacity-100 translate-x-0" : "opacity-0 translate-x-100"
          }`}
        >
          <svg
            id="sunIcon"
            className="w-4 h-4 text-gray-500 dark:text-gray-100 transition-opacity"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325 3.325l-.707.707M6.343 6.343l-.707-.707m12.728 0l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
        </div>

        {/* Handle (the white circle) */}
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isDark ? "translate-x-full" : "translate-x-0"
          }`}
        ></div>
      </div>
    </label>
  );
}
