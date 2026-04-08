import React from "react";
import { type Language } from "prism-react-renderer";
import { THEMES, LANGUAGE_OPTIONS } from "./constants";

interface Props {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeName: keyof typeof THEMES;
  setThemeName: (theme: keyof typeof THEMES) => void;
}

export const LanguageThemeSettings: React.FC<Props> = ({
  language,
  setLanguage,
  themeName,
  setThemeName,
}) => (
  <>
    <div>
      <label htmlFor="language-select" className="block mb-1 font-bold">
        Lenguaje
      </label>
      <select
        id="language-select"
        className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        {LANGUAGE_OPTIONS.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label htmlFor="theme-select" className="block mb-1 font-bold">
        Tema
      </label>
      <select
        id="theme-select"
        className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value as keyof typeof THEMES)}
      >
        {Object.keys(THEMES).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  </>
);
