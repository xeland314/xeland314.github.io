import React from "react";
import type { ThemeMode, AccentColor, SlideData, SlideType } from "./types";
import type { SocialPreviewMode } from "./sidebar/types";
import { GlobalSettings } from "./sidebar/GlobalSettings";
import { SlideList, SlideAdder } from "./sidebar/SlideList";
import { SlideEditor } from "./sidebar/SlideEditor";
import { ExportActions, type ExportFormat } from "./sidebar/ExportActions";

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
  duplicateSlide: (id: string) => void;
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  exportQuality: number;
  setExportQuality: (quality: number) => void;
  onExportAll: () => void;
  onExportCurrent: () => void;
}

const SectionHeader = ({
  dot,
  title,
  count,
}: {
  dot: string;
  title: React.ReactNode;
  count?: React.ReactNode;
}) => (
  <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <span className={`w-2 h-2 rounded-full ${dot} flex-shrink-0`}></span>
    <h3 className="text-sm font-bold flex-1">{title}</h3>
    {count}
    <ChevronIcon />
  </summary>
);

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
  duplicateSlide,
  exportFormat,
  setExportFormat,
  exportQuality,
  setExportQuality,
  onExportAll,
  onExportCurrent,
}) => {
  const selectedSlide = slides.find((s) => s.id === selectedSlideId);

  return (
    <div className="w-full lg:w-96 lg:h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden rounded-3xl">
      {/* Fixed header with export buttons */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-3">
        <ExportActions
          onExportCurrent={onExportCurrent}
          onExportAll={onExportAll}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          exportQuality={exportQuality}
          setExportQuality={setExportQuality}
        />
      </div>

      {/* Scrollable middle: slide list + editor always visible primero */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <details open className="group">
          <SectionHeader
            dot="bg-emerald-500"
            title="Diapositivas"
            count={
              <span className="text-xs text-gray-400 font-mono">{slides.length}</span>
            }
          />
          <div className="p-3 space-y-1.5">
            <SlideAdder addSlide={addSlide} />
            <SlideList
              slides={slides}
              selectedSlideId={selectedSlideId}
              setSelectedSlideId={setSelectedSlideId}
              addSlide={addSlide}
              removeSlide={removeSlide}
              moveSlide={moveSlide}
              duplicateSlide={duplicateSlide}
            />
          </div>
        </details>

        {selectedSlide && (
          <details open className="group border-t border-gray-100 dark:border-gray-700/50">
            <SectionHeader
              dot="bg-orange-500"
              title={
                <>
                  Editando{" "}
                  <span className="capitalize text-blue-600 dark:text-blue-400">
                    {selectedSlide.type}
                  </span>
                </>
              }
            />
            <div className="p-4 space-y-4">
              <SlideEditor slide={selectedSlide} updateSlide={updateSlide} />
            </div>
          </details>
        )}
      </div>

      {/* Bottom: configuración menos frecuente, colapsada */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
        <details className="group">
          <SectionHeader dot="bg-blue-500" title="Diseño global" />
          <div className="px-4 pb-4 space-y-4">
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
