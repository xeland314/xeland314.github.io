import React from "react";

export type ExportFormat = "jpeg" | "png";

interface ExportActionsProps {
  onExportCurrent: () => void;
  onExportAll: () => void;
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  exportQuality: number;
  setExportQuality: (quality: number) => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onExportCurrent,
  onExportAll,
  exportFormat,
  setExportFormat,
  exportQuality,
  setExportQuality,
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2">
      <button
        onClick={onExportCurrent}
        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        Exportar Diapositiva
      </button>
      <button
        onClick={onExportAll}
        className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-sm"
      >
        Descargar Todo (.zip)
      </button>
    </div>
    
    <div className="flex items-center gap-3">
      <div className="flex gap-1 flex-1">
        <button
          onClick={() => setExportFormat("jpeg")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            exportFormat === "jpeg"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          JPG
        </button>
        <button
          onClick={() => setExportFormat("png")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            exportFormat === "png"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          PNG
        </button>
      </div>
      {exportFormat === "jpeg" && (
        <div className="flex items-center gap-2 flex-1">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={exportQuality}
            onChange={(e) => setExportQuality(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[10px] font-bold text-gray-400 w-8 text-right">
            {Math.round(exportQuality * 100)}%
          </span>
        </div>
      )}
    </div>
  </div>
);
