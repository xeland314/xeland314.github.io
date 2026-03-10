import React from 'react';
import { type Language } from 'prism-react-renderer';
import { THEMES } from './constants';

interface Props {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeName: keyof typeof THEMES;
  setThemeName: (theme: keyof typeof THEMES) => void;
}

export const LanguageThemeSettings: React.FC<Props> = ({
  language, setLanguage, themeName, setThemeName
}) => (
  <>
    <div>
      <label className="block mb-1 font-bold">Lenguaje</label>
      <select
        className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="rust">Rust</option>
        <option value="go">Go</option>
        <option value="cpp">C++</option>
        <option value="css">CSS</option>
        <option value="html">HTML</option>
      </select>
    </div>

    <div>
      <label className="block mb-1 font-bold">Tema</label>
      <select
        className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value as keyof typeof THEMES)}
      >
        {Object.keys(THEMES).map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  </>
);
