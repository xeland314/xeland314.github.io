import React from "react";
import { type Language } from "prism-react-renderer";
import { THEMES } from "./constants";
import { LanguageThemeSettings } from "./LanguageThemeSettings";
import { VideoSettings } from "./VideoSettings";
import { ControlButtons } from "./ControlButtons";

interface SidebarProps {
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
  width: number;
  setWidth: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
  topPadding: number;
  setTopPadding: (p: number) => void;
  typingSpeed: number;
  setTypingSpeed: (s: number) => void;
  fps: number;
  setFps: (f: number) => void;
  fontSize: number;
  setFontSize: (fs: number) => void;
  isRendering: boolean;
  progress: number;
  onPreview: () => void;
  onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <div className="w-full lg:w-80 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl h-fit sticky top-4">
      <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        Configuración
      </h2>

      <div className="space-y-4 text-sm">
        <LanguageThemeSettings
          usePlainText={props.usePlainText}
          setUsePlainText={props.setUsePlainText}
          language={props.language}
          setLanguage={props.setLanguage}
          themeName={props.themeName}
          setThemeName={props.setThemeName}
          plainTextColor={props.plainTextColor}
          setPlainTextColor={props.setPlainTextColor}
          plainBgColor={props.plainBgColor}
          setPlainBgColor={props.setPlainBgColor}
        />

        <VideoSettings
          width={props.width}
          setWidth={props.setWidth}
          height={props.height}
          setHeight={props.setHeight}
          topPadding={props.topPadding}
          setTopPadding={props.setTopPadding}
          typingSpeed={props.typingSpeed}
          setTypingSpeed={props.setTypingSpeed}
          fps={props.fps}
          setFps={props.setFps}
          fontSize={props.fontSize}
          setFontSize={props.setFontSize}
        />

        <ControlButtons
          isRendering={props.isRendering}
          progress={props.progress}
          onPreview={props.onPreview}
          onExport={props.onExport}
        />
      </div>
    </div>
  );
};
