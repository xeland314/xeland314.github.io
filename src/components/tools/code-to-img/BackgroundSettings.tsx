import React from "react";

interface Props {
  bgType: "color" | "image";
  setBgType: (t: "color" | "image") => void;
  bgBlur: number;
  setBgBlur: (bl: number) => void;
  bgOpacity: number;
  setBgOpacity: (op: number) => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  handleBgUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BackgroundSettings: React.FC<Props> = ({
  bgType,
  setBgType,
  bgBlur,
  setBgBlur,
  bgOpacity,
  setBgOpacity,
  bgColor,
  setBgColor,
  handleBgUpload,
}) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="bg-blur" className="block mb-1 font-bold">
          Blur ({bgBlur}px)
        </label>
        <input
          id="bg-blur"
          type="range"
          min="0"
          max="20"
          value={bgBlur}
          onChange={(e) => setBgBlur(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="bg-opacity" className="block mb-1 font-bold">
          Opacidad ({bgOpacity}%)
        </label>
        <input
          id="bg-opacity"
          type="range"
          min="0"
          max="100"
          value={bgOpacity}
          onChange={(e) => setBgOpacity(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
    <div>
      <label htmlFor="bg-type" className="block mb-1 font-bold">
        Tipo de Fondo
      </label>
      <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        <button
          id="bg-type"
          className={`flex-1 py-1 text-xs rounded-md transition-all ${bgType === "color" ? "bg-white dark:bg-gray-600 shadow-sm font-bold" : "opacity-50"}`}
          onClick={() => setBgType("color")}
          type="button"
        >
          Color
        </button>
        <button
          id="bg-image"
          className={`flex-1 py-1 text-xs rounded-md transition-all ${bgType === "image" ? "bg-white dark:bg-gray-600 shadow-sm font-bold" : "opacity-50"}`}
          onClick={() => setBgType("image")}
          type="button"
        >
          Imagen
        </button>
      </div>
    </div>
    {bgType === "color" ? (
      <div>
        <label htmlFor="bg-color" className="block mb-1 font-bold">
          Color de Fondo
        </label>
        <div className="flex gap-2">
          <input
            id="bg-color"
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-10 h-10 p-1 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            id="bg-color-text"
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600 font-mono text-xs uppercase"
          />
        </div>
      </div>
    ) : (
      <div>
        <label htmlFor="bg-image" className="block mb-1 font-bold">
          Fondo Personalizado
        </label>
        <input
          id="bg-image"
          type="file"
          accept="image/*"
          onChange={handleBgUpload}
          className="p-2 rounded-md w-full text-xs bg-gray-100 dark:bg-gray-600 hover:bg-blue-500"
        />
      </div>
    )}
  </>
);
