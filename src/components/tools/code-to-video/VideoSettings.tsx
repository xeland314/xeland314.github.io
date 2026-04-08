import React from "react";

interface Props {
  width: number;
  setWidth: (w: number) => void;
  height: number;
  setHeight: (h: number) => void;
  topPadding: number;
  setTopPadding: (p: number) => void;
  typingSpeed: number;
  setTypingSpeed: (s: number) => void;
  fps: number;
  setFps: (f: number) => void;
  fontSize: number;
  setFontSize: (fs: number) => void;
}

export const VideoSettings: React.FC<Props> = ({
  width,
  setWidth,
  height,
  setHeight,
  topPadding,
  setTopPadding,
  typingSpeed,
  setTypingSpeed,
  fps,
  setFps,
  fontSize,
  setFontSize,
}) => (
  <>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label
          htmlFor="width"
          className="block mb-1 font-bold text-xs uppercase opacity-50"
        >
          Ancho
        </label>
        <input
          type="number"
          id="width"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
        />
      </div>
      <div>
        <label
          htmlFor="height"
          className="block mb-1 font-bold text-xs uppercase opacity-50"
        >
          Alto
        </label>
        <input
          type="number"
          id="height"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          className="w-full bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-300 dark:border-gray-600"
        />
      </div>
    </div>

    <div>
      <label htmlFor="top-padding" className="block mb-1 font-bold">
        Top Padding ({topPadding}px)
      </label>
      <input
        id="top-padding"
        type="range"
        min="0"
        max="800"
        value={topPadding}
        onChange={(e) => setTopPadding(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>

    <div>
      <label htmlFor="typing-speed" className="block mb-1 font-bold">
        Caracteres / seg ({typingSpeed})
      </label>
      <input
        id="typing-speed"
        type="range"
        min="10"
        max="300"
        value={typingSpeed}
        onChange={(e) => setTypingSpeed(Number(e.target.value))}
        className="w-full"
      />
    </div>

    <div>
      <label htmlFor="fps" className="block mb-1 font-bold">
        FPS ({fps})
      </label>
      <input
        id="fps"
        type="range"
        min="24"
        max="60"
        value={fps}
        onChange={(e) => setFps(Number(e.target.value))}
        className="w-full"
      />
    </div>

    <div>
      <label htmlFor="font-size" className="block mb-1 font-bold">
        Tamaño Fuente ({fontSize}px)
      </label>
      <input
        id="font-size"
        type="range"
        min="12"
        max="64"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
        className="w-full"
      />
    </div>
  </>
);
