import React from "react";

interface Props {
  handleExport: () => void;
}

export const ExportButton: React.FC<Props> = ({ handleExport }) => (
  <button
    onClick={handleExport}
    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
    type="button"
  >
    Exportar Imagen (PNG)
  </button>
);
