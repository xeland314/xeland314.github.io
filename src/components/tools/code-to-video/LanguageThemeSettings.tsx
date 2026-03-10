import React from 'react';
import { type Language } from 'prism-react-renderer';
import { THEMES } from './constants';

interface Props {
  usePlainText: boolean;
  setUsePlainText: (v: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  themeName: keyof typeof THEMES;
  setThemeName: (theme: keyof typeof THEMES) => void;
  plainTextColor: string;
  setPlainTextColor: (color: string) => void;
  plainBgColor: string;
  setPlainBgColor: (color: string) => void;
}

export const LanguageThemeSettings: React.FC<Props> = ({
  usePlainText, setUsePlainText,
  language, setLanguage,
  themeName, setThemeName,
  plainTextColor, setPlainTextColor,
  plainBgColor, setPlainBgColor
}) => (
  <>
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
        <label className="font-bold text-xs uppercase opacity-70">Texto Plano</label>
        <input 
            type="checkbox" 
            checked={usePlainText} 
            onChange={e => setUsePlainText(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
        />
    </div>

    {!usePlainText ? (
        <div>
            <label className="block mb-1 font-bold">Lenguaje / Tema</label>
            <div className="grid grid-cols-2 gap-2">
                <select value={language} onChange={e => setLanguage(e.target.value as Language)} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 outline-none">
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="cpp">C++</option>
                </select>
                <select value={themeName} onChange={e => setThemeName(e.target.value as keyof typeof THEMES)} className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 outline-none">
                {Object.keys(THEMES).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>
    ) : (
        <div className="space-y-2">
            <div>
                <label className="block mb-1 font-bold text-xs uppercase opacity-50">Color Texto</label>
                <div className="flex gap-2">
                    <input type="color" value={plainTextColor} onChange={e => setPlainTextColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                    <input type="text" value={plainTextColor} onChange={e => setPlainTextColor(e.target.value)} className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono" />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-bold text-xs uppercase opacity-50">Color Fondo</label>
                <div className="flex gap-2">
                    <input type="color" value={plainBgColor} onChange={e => setPlainBgColor(e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                    <input type="text" value={plainBgColor} onChange={e => setPlainBgColor(e.target.value)} className="flex-1 bg-gray-50 dark:bg-gray-700 px-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono" />
                </div>
            </div>
        </div>
    )}
  </>
);
