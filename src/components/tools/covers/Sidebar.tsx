import React from "react";
import type { ThemeMode, AccentColor, SlideData, SlideType } from "./types";
import type { SocialPreviewMode } from "./sidebar/types";
import { GlobalSettings } from "./sidebar/GlobalSettings";
import { SlideList, SlideAdder } from "./sidebar/SlideList";
import { SlideEditor } from "./sidebar/SlideEditor";
import { ExportActions } from "./sidebar/ExportActions";

interface SidebarProps {
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
  slides: SlideData[];
  selectedSlideId: string;
  setSelectedSlideId: (id: string) => void;
  updateSlide: (id: string, data: Partial<SlideData>) => void;
  addSlide: (type: SlideType) => void;
  removeSlide: (id: string) => void;
  moveSlide: (id: string, direction: "up" | "down") => void;
  onExportAll: () => void;
  onExportCurrent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  slides,
  selectedSlideId,
  setSelectedSlideId,
  updateSlide,
  addSlide,
  removeSlide,
  moveSlide,
  onExportAll,
  onExportCurrent,
}) => {
  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  return (
    <div className="w-full lg:w-96 h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
      {/* Fixed header with export buttons */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <ExportActions onExportCurrent={onExportCurrent} onExportAll={onExportAll} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <details open className="group">
          <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
            <h3 className="text-sm font-bold flex-1">Configuración Global</h3>
            <ChevronIcon />
          </summary>
          <div className="p-4 space-y-4">
            <GlobalSettings
              mode={mode}
              setMode={setMode}
              accent={accent}
              setAccent={setAccent}
              showLogo={showLogo}
              setShowLogo={setShowLogo}
              logoImage={logoImage}
              setLogoImage={setLogoImage}
              username={username}
              setUsername={setUsername}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
            />
          </div>
        </details>

        <details open className="group">
          <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <h3 className="text-sm font-bold flex-1">Diapositivas</h3>
            <span className="text-xs text-gray-400 font-mono">{slides.length}</span>
            <ChevronIcon />
          </summary>
          <div className="p-4 space-y-3">
            <SlideAdder addSlide={addSlide} />
            <SlideList
              slides={slides}
              selectedSlideId={selectedSlideId}
              setSelectedSlideId={setSelectedSlideId}
              addSlide={addSlide}
              removeSlide={removeSlide}
              moveSlide={moveSlide}
            />
          </div>
        </details>

        {selectedSlide && (
          <details open className="group">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700/50 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></span>
              <h3 className="text-sm font-bold flex-1">Editar: {selectedSlide.type}</h3>
              <ChevronIcon />
            </summary>
            <div className="p-4 space-y-4">
              <SlideEditor slide={selectedSlide} updateSlide={updateSlide} />
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

const ChevronIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
