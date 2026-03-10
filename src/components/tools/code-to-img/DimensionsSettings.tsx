import React from 'react';

interface Props {
  width: number;
  setWidth: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
  padding: number;
  setPadding: (p: number) => void;
}

export const DimensionsSettings: React.FC<Props> = ({
  width, setWidth, height, setHeight, padding, setPadding
}) => (
  <>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block mb-1 font-bold">Ancho (px)</label>
        <input
          type="number"
          className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block mb-1 font-bold">Alto (px)</label>
        <input
          type="number"
          className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
      </div>
    </div>
    <div>
      <label className="block mb-1 font-bold">Padding ({padding}px)</label>
      <input type="range" min="0" max="400" value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full" />
    </div>
  </>
);
