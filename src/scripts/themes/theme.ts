export const ALL_THEMES = ["dark", "blue", "orange", "green", "light"];
export const DEFAULT_THEME = "dark";

export type Theme = "light" | "dark" | "blue" | "orange" | "green" | string;

export function getThemePreferenceFromStorage(): Theme {
  if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
    const storedTheme = localStorage.getItem("theme");
    if (ALL_THEMES.includes(storedTheme!)) {
      return storedTheme!;
    }
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : DEFAULT_THEME;
}

export function applyTheme(theme: Theme) {
  const htmlElement = document.documentElement; // Queremos aplicar la clase al <html>

  // 1. Limpia todas las clases de tema posibles del <html>
  ALL_THEMES.forEach((t) => {
    htmlElement.classList.remove(t);
  });

  // 2. Añade la clase del tema actual
  // Si el tema es 'light', no añadimos una clase específica 'light' si es el default
  // Puedes decidir añadir '.light' si quieres estilos explícitos para él.
  if (theme !== "light") {
    // Solo añade la clase si no es el tema "light"
    htmlElement.classList.add(theme);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem("theme", theme);
  }
}
