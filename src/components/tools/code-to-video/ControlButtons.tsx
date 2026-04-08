import React from "react";

interface Props {
  isRendering: boolean;
  progress: number;
  onPreview: () => void;
  onExport: () => void;
}

export const ControlButtons: React.FC<Props> = ({
  isRendering,
  progress,
  onPreview,
  onExport,
}) => (
  <div className="pt-4 space-y-3">
    <button
      onClick={onPreview}
      disabled={isRendering}
      className="w-full py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-bold rounded-xl transition-all disabled:opacity-50"
      type="button"
    >
      Vista Previa
    </button>
    <button
      onClick={onExport}
      disabled={isRendering}
      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      type="button"
    >
      {isRendering ? `Renderizando ${progress}%...` : "Exportar Video"}
    </button>
  </div>
);
