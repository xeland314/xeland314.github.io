import React from "react";

interface Props {
  fontSize: number;
  setFontSize: (fs: number) => void;
  showLineNumbers: boolean;
  setShowLineNumbers: (show: boolean) => void;
}

export const FontSettings: React.FC<Props> = ({
  fontSize,
  setFontSize,
  showLineNumbers,
  setShowLineNumbers,
}) => (
  <>
    <div>
      <label htmlFor="font-size-input" className="block mb-1 font-bold">
        Tamaño Fuente ({fontSize}px)
      </label>
      <input
        id="font-size-input"
        type="range"
        min="12"
        max="64"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="w-full"
      />
    </div>
    <div className="flex items-center gap-2">
      <input
        id="line-numbers-checkbox"
        type="checkbox"
        checked={showLineNumbers}
        onChange={(e) => setShowLineNumbers(e.target.checked)}
      />
      <label htmlFor="line-numbers-checkbox" className="font-bold">
        Números de línea
      </label>
    </div>
  </>
);
