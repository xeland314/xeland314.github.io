import React from 'react';
import { type Language } from 'prism-react-renderer';

interface VideoPreviewProps {
  code: string;
  setCode: (code: string) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  isRendering: boolean;
  usePlainText: boolean;
  language: Language;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  code, setCode, canvasRef, width, height, isRendering, usePlainText, language
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <textarea
        className="w-full h-40 p-4 font-mono text-sm bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner outline-none resize-y hover:border-blue-500 transition-colors"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Escribe tu código aquí..."
      />

      <div className="flex-1 bg-black/90 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-gray-700 relative shadow-2xl">
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height}
          className="max-h-full max-w-full object-contain"
          style={{ width: 'auto', height: '100%', aspectRatio: `${width}/${height}` }}
        />
        {!isRendering && (
            <div className="absolute top-8 left-8 bg-blue-600/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white border border-white/10 uppercase tracking-widest font-black shadow-xl">
              {usePlainText ? 'Plain Text' : language} • Preview
            </div>
        )}
      </div>
    </div>
  );
};
