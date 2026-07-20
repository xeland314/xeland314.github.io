import React from "react";

interface ExportActionsProps {
  onExportCurrent: () => void;
  onExportAll: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onExportCurrent,
  onExportAll,
}) => (
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
);
