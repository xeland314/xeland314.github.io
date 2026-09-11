type Props = {
  rotationDeg: number;
  rotationInput: string;
  setRotationInput: (v: string) => void;
  rotateMap: (delta: number) => void;
  handleCustomRotate: () => void;
  setRotationDeg: (v: number) => void;
  knobRef: React.RefObject<HTMLDivElement | null>;
  handleKnobPointerDown: (e: React.MouseEvent | React.TouchEvent) => void;
  mapRef: React.MutableRefObject<any>;
};

export function RotationControl({
  rotationDeg,
  rotationInput,
  setRotationInput,
  rotateMap,
  handleCustomRotate,
  setRotationDeg,
  knobRef,
  handleKnobPointerDown,
  mapRef,
}: Props) {
  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
        Rotar mapa <span className="font-mono text-[11px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 rounded-full">{rotationDeg}°</span>
      </p>
      <div className="flex gap-1.5 mt-2">
        <button type="button" onClick={() => rotateMap(-45)} className="flex-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl hover:bg-slate-50" title="Antihorario 45°">
          ↺ 45°
        </button>
        <button type="button" onClick={() => rotateMap(45)} className="flex-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl hover:bg-slate-50" title="Horario 45°">
          ↻ 45°
        </button>
        <button
          type="button"
          onClick={() => {
            setRotationDeg(0);
            setTimeout(() => mapRef.current?.invalidateSize(), 350);
          }}
          className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl"
        >
          Reset
        </button>
      </div>
      <div className="flex gap-1.5 mt-2">
        <input type="number" value={rotationInput} onChange={(e) => setRotationInput(e.target.value)} placeholder="45" className="w-20 text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 bg-white dark:bg-slate-800 dark:text-white font-mono" />
        <button type="button" onClick={() => rotateMap(-parseInt(rotationInput || "0") || 0)} className="flex-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl">
          ↺ X°
        </button>
        <button type="button" onClick={() => rotateMap(parseInt(rotationInput || "0") || 0)} className="flex-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-2 rounded-xl">
          ↻ X°
        </button>
        <button type="button" onClick={handleCustomRotate} className="text-[11px] font-bold bg-violet-600 text-white px-3 py-2 rounded-xl">
          Ir a X°
        </button>
      </div>
      <div className="flex items-center gap-3 mt-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
        <div
          ref={knobRef}
          onMouseDown={handleKnobPointerDown}
          onTouchStart={handleKnobPointerDown}
          className="w-20 h-20 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 relative shadow-inner cursor-grab active:cursor-grabbing select-none shrink-0 touch-none"
          title="Arrastra para rotar 360°"
        >
          <div className="absolute inset-1 rounded-full border border-slate-200 dark:border-slate-700 pointer-events-none"></div>
          <div className="absolute left-1/2 top-1/2 w-1 h-1 bg-slate-900 dark:bg-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute left-1/2 top-1 w-1.5 h-7 bg-emerald-500 rounded-full -translate-x-1/2 origin-bottom pointer-events-none" style={{ transform: `translateX(-50%) rotate(${rotationDeg}deg)` }}></div>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 pointer-events-none mt-5">{rotationDeg}°</span>
        </div>
        <div className="flex-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          <p className="font-bold text-slate-700 dark:text-slate-300">Perilla 360°</p>
          <p>Arrastra la aguja verde. Gira el mapa completo (tiles + marcadores). El contenedor queda fijo; interior sobredimensionado 200% cubre esquinas sin blanco.</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-1">Rotación visual CSS (no afecta coordenadas). Horario = +X°, antihorario = -X°.</p>
    </div>
  );
}
