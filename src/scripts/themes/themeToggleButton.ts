// src/scripts/themeToggleButton.ts
import { ALL_THEMES, DEFAULT_THEME, applyTheme } from "./theme";

const themeToggleCheckbox = document.getElementById(
  "themeToggleCheckbox"
) as HTMLInputElement;
const themeToggleHandle = document.getElementById(
  "themeToggleHandle"
) as HTMLDivElement;
const moonIcon = document.getElementById("moonIcon") as unknown as SVGElement;
const sunIcon = document.getElementById("sunIcon") as unknown as SVGElement;

const updateThemeUI = (theme: string) => {
  const isDarkThemeActive = theme === "dark";
  themeToggleCheckbox.checked = isDarkThemeActive;

  if (isDarkThemeActive) {
    themeToggleHandle.classList.add("-translate-x-5");
    themeToggleHandle.classList.remove("translate-x-0");
    moonIcon.classList.add("opacity-100", "translate-x-6"); // Si usas translate-x-6, asegúrate que esté en tu tailwind.config
    moonIcon.classList.remove("opacity-0");
    sunIcon.classList.add("opacity-0");
    sunIcon.classList.remove("opacity-100", "-translate-x-2");
  } else {
    themeToggleHandle.classList.add("translate-x-0");
    themeToggleHandle.classList.remove("-translate-x-5");
    moonIcon.classList.add("opacity-0");
    moonIcon.classList.remove("opacity-100", "translate-x-6");
    sunIcon.classList.add("opacity-100", "-translate-x-2"); // Si usas -translate-x-2, asegúrate que esté en tu tailwind.config
    sunIcon.classList.remove("opacity-0");
  }
};

const toggleTheme = () => {
  const htmlElement = document.documentElement;
  let currentTheme: string = DEFAULT_THEME; // Inicializa con el tema por defecto

  // Encuentra la clase de tema activa en el htmlElement
  // Si no hay ninguna clase de tema, asumimos 'light' (o el DEFAULT_THEME si es otra cosa)
  const activeThemeClass = ALL_THEMES.find((t) =>
    htmlElement.classList.contains(t)
  );
  if (activeThemeClass) {
    currentTheme = activeThemeClass;
  } else if (!htmlElement.classList.contains("dark")) {
    // Si no hay clase de tema y no es 'dark', asumimos 'light'
    currentTheme = "light";
  }

  let newTheme: string;

  // Lógica para alternar SOLAMENTE entre 'dark' y 'light'
  if (currentTheme === "dark") {
    newTheme = "light";
  } else {
    // Si el tema actual no es 'dark' (es 'light', 'blue', 'orange', 'green'),
    // el botón lo cambiará a 'dark'.
    newTheme = "dark";
  }

  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme); // applyTheme ahora usa clases
  updateThemeUI(newTheme);
};

if (themeToggleCheckbox) {
  themeToggleCheckbox.addEventListener("change", toggleTheme);
}

requestAnimationFrame(() => {
  // Inicializar la UI del botón con el tema actual al cargar
  const htmlElement = document.documentElement;
  let initialThemeFromDOM: string = DEFAULT_THEME;
  const activeThemeClass = ALL_THEMES.find((t) =>
    htmlElement.classList.contains(t)
  );
  if (activeThemeClass) {
    initialThemeFromDOM = activeThemeClass;
  } else if (!htmlElement.classList.contains("dark")) {
    // Si no hay clase de tema y no es 'dark', asumimos 'light'
    initialThemeFromDOM = "light";
  }

  updateThemeUI(initialThemeFromDOM);
});
