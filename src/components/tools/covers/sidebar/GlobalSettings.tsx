import React from "react";
import {
  ACCENT_COLORS,
  type ThemeMode,
  type AccentColor,
} from "../types";
import type { SocialPreviewMode } from "./types";

const THEME_OPTIONS: { value: ThemeMode; label: string; bg: string; dot: string }[] = [
  { value: "light", label: "Claro", bg: "bg-white", dot: "bg-gray-50 border border-gray-200" },
  { value: "dark", label: "Oscuro", bg: "bg-gray-900", dot: "bg-slate-800 border border-slate-700" },
  { value: "midnight", label: "Midnight", bg: "bg-[#020617]", dot: "bg-blue-950 border border-blue-900" },
  { value: "soft", label: "Soft", bg: "bg-[#f8fafc]", dot: "bg-[#f1f5f9] border border-slate-200" },
  { value: "catppuccin", label: "Catppuccin", bg: "bg-[#1e1e2e]", dot: "bg-[#302d41] border border-[#f5e0dc]" },
  { value: "ambercat", label: "Ambercat", bg: "bg-[#1e1e1e]", dot: "bg-[#3c3836] border border-[#fabd2f]" },
  { value: "rose", label: "Rose", bg: "bg-[#1f1f1f]", dot: "bg-[#3e3e3e] border border-[#f38ba8]" },
  { value: "blue", label: "Blue", bg: "bg-[#0c0c2b]", dot: "bg-[#1e1e7e] border border-[#89b4fa]" },
  { value: "obsidian", label: "Obsidian", bg: "bg-[#09090b]", dot: "bg-zinc-900 border border-zinc-700" },
];

const PREVIEW_OPTIONS: { value: SocialPreviewMode; label: string; hint: string }[] = [
  { value: "threads", label: "Threads", hint: "1080×1350" },
  { value: "facebook", label: "Facebook", hint: "1080×1080" },
  { value: "tiktok", label: "TikTok", hint: "1080×1920" },
];

interface GlobalSettingsProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  logoImage: string;
  setLogoImage: (logo: string) => void;
  username: string;
  setUsername: (name: string) => void;
  previewMode: SocialPreviewMode;
  setPreviewMode: (mode: SocialPreviewMode) => void;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  mode,
  setMode,
  accent,
  setAccent,
  showLogo,
  setShowLogo,
  logoImage,
  setLogoImage,
  username,
  setUsername,
  previewMode,
  setPreviewMode,
}) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">Tema</label>
        <div className="flex flex-wrap justify-evenly gap-3">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setMode(t.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${t.bg} ${
                mode === t.value
                  ? "border-blue-500 scale-110 shadow-lg"
                  : "border-gray-200 opacity-60 hover:opacity-100"
              }`}
              title={t.label}
            >
              <div className={`w-5 h-5 rounded-full ${t.dot}`} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">Color de Acento</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(ACCENT_COLORS).map((color) => (
            <button
              key={color}
              onClick={() => setAccent(color as AccentColor)}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                accent === color
                  ? "border-gray-900 dark:border-white scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              } ${ACCENT_COLORS[color as AccentColor].bg}`}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-500">Logo del Sitio</label>
          <button
            onClick={() => setShowLogo(!showLogo)}
            className={`text-[10px] px-2 py-1 rounded transition-colors ${showLogo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
          >
            {showLogo ? "VISIBLE" : "OCULTO"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-900">
            <img src={logoImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <label className="flex-1 cursor-pointer">
            <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-bold text-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              CAMBIAR LOGO
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">Nombre de Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 outline-none focus:border-blue-500 text-sm font-bold"
          placeholder="Ej. xeland314"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-500 block mb-2">Vista Social</label>
        <div className="grid grid-cols-3 gap-2">
          {PREVIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreviewMode(option.value)}
              className={`py-2 px-2 rounded-2xl border text-xs font-bold transition-all ${
                previewMode === option.value
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600"
              }`}
            >
              <span>{option.label}</span>
              <span className="block text-[10px] mt-1 opacity-80">{option.hint}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          LinkedIn no se muestra aquí; la vista se concentra en carruseles e imágenes individuales de Threads, Facebook y TikTok.
        </p>
      </div>
    </div>
  );
};
