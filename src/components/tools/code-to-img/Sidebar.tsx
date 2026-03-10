import React from 'react';
import { type Language } from 'prism-react-renderer';
import { THEMES } from './constants';
import { LanguageThemeSettings } from './LanguageThemeSettings';
import { DimensionsSettings } from './DimensionsSettings';
import { BackgroundSettings } from './BackgroundSettings';
import { FontSettings } from './FontSettings';
import { WatermarkSettings } from './WatermarkSettings';
import { ExportButton } from './ExportButton';

interface SidebarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  themeName: keyof typeof THEMES;
  setThemeName: (theme: keyof typeof THEMES) => void;
  width: number;
  setWidth: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
  padding: number;
  setPadding: (p: number) => void;
  bgType: 'color' | 'image';
  setBgType: (t: 'color' | 'image') => void;
  bgBlur: number;
  setBgBlur: (bl: number) => void;
  bgOpacity: number;
  setBgOpacity: (op: number) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  handleBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fontSize: number;
  setFontSize: (fs: number) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
  showFooter: boolean;
  setShowFooter: (show: boolean) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  showUsername: boolean;
  setShowUsername: (show: boolean) => void;
  username: string;
  setUsername: (username: string) => void;
  handleExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  language, setLanguage, themeName, setThemeName,
  width, setWidth, height, setHeight, padding, setPadding,
  bgType, setBgType, bgBlur, setBgBlur, bgOpacity, setBgOpacity, bgColor, setBgColor, handleBgUpload,
  fontSize, setFontSize, showLineNumbers, setShowLineNumbers,
  showFooter, setShowFooter, showLogo, setShowLogo, showUsername, setShowUsername, username, setUsername,
  handleExport
}) => {
  return (
    <div className="w-full lg:w-80 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl h-fit sticky top-4">
      <h2 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Configuración</h2>
      
      <div className="space-y-4 text-sm">
        <LanguageThemeSettings 
          language={language} setLanguage={setLanguage} 
          themeName={themeName} setThemeName={setThemeName} 
        />
        
        <DimensionsSettings 
          width={width} setWidth={setWidth} 
          height={height} setHeight={setHeight} 
          padding={padding} setPadding={setPadding} 
        />
        
        <BackgroundSettings 
          bgType={bgType} setBgType={setBgType} 
          bgBlur={bgBlur} setBgBlur={setBgBlur} 
          bgOpacity={bgOpacity} setBgOpacity={setBgOpacity} 
          bgColor={bgColor} setBgColor={setBgColor} 
          handleBgUpload={handleBgUpload} 
        />
        
        <FontSettings 
          fontSize={fontSize} setFontSize={setFontSize} 
          showLineNumbers={showLineNumbers} setShowLineNumbers={setShowLineNumbers} 
        />
        
        <WatermarkSettings 
          showFooter={showFooter} setShowFooter={setShowFooter} 
          showLogo={showLogo} setShowLogo={setShowLogo} 
          showUsername={showUsername} setShowUsername={setShowUsername} 
          username={username} setUsername={setUsername} 
        />
        
        <ExportButton handleExport={handleExport} />
      </div>
    </div>
  );
};
