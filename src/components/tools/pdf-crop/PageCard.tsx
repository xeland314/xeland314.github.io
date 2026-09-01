import React, { useEffect, useRef, useState, memo } from "react";
import type { NormalizedRect } from "./pdfOperations";
import { isFullRect } from "./pdfOperations";
import type { PageRotation, Quad } from "./storage";

interface Props {
  pageIndex: number; // 0-based
  thumbnailSrc: string | null; // low-res JPEG cache (180px), null = aún generando
  rect: NormalizedRect;
  quad?: Quad | null;
  rotation?: PageRotation;
  isSelected: boolean;
  previewCrop: boolean;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
  onRotate: (idx: number, delta: 90 | -90) => void;
  onQuadToggle: (idx: number) => void;
  onQuadPoint: (idx: number, pIdx: number, pt: { x: number; y: number }) => void;
  onRectChange: (idx: number, newRect: NormalizedRect, startRect: NormalizedRect) => void;
  onPreview: (idx: number) => void;
}

const PageCard = memo(({ pageIndex, thumbnailSrc, rect, quad = null, rotation = 0, isSelected, previewCrop, onSelect, onDelete, onRotate, onQuadToggle, onQuadPoint, onRectChange, onPreview }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dragRef = useRef<null | { type: "move" | "resize"; handle?: string; startX: number; startY: number; startRect: NormalizedRect }>(null);
  const quadDragRef = useRef<null | { pIdx: number; startX: number; startY: number; startQuad: Quad }>(null);

  useEffect(() => {
    const el = wrapRef.current?.parentElement ?? wrapRef.current;
    if (!el) { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setVisible(true); io.disconnect(); break; }
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handlePointerDown = (e: React.PointerEvent, type: "move" | "resize", handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { type, handle, startX: e.clientX, startY: e.clientY, startRect: { ...rect } };
    (e.target as Element).setPointerCapture?.(e.nativeEvent.pointerId);
  };
  const handleQuadPointerDown = (e: React.PointerEvent, pIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!quad) return;
    quadDragRef.current = { pIdx, startX: e.clientX, startY: e.clientY, startQuad: quad.map(p=>({ ...p })) as Quad };
    (e.target as Element).setPointerCapture?.(e.nativeEvent.pointerId);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !wrapRef.current) return;
      const wrapRect = wrapRef.current.getBoundingClientRect();
      const dxNorm = (e.clientX - d.startX) / wrapRect.width;
      const dyNorm = (e.clientY - d.startY) / wrapRect.height;
      let nr: NormalizedRect = { ...d.startRect };
      if (d.type === "move") {
        nr.x = d.startRect.x + dxNorm;
        nr.y = d.startRect.y + dyNorm;
      } else {
        const h = d.handle;
        if (h === "se") { nr.w = d.startRect.w + dxNorm; nr.h = d.startRect.h + dyNorm; }
        else if (h === "nw") { nr.x = d.startRect.x + dxNorm; nr.y = d.startRect.y + dyNorm; nr.w = d.startRect.w - dxNorm; nr.h = d.startRect.h - dyNorm; }
        else if (h === "ne") { nr.y = d.startRect.y + dyNorm; nr.w = d.startRect.w + dxNorm; nr.h = d.startRect.h - dyNorm; }
        else if (h === "sw") { nr.x = d.startRect.x + dxNorm; nr.w = d.startRect.w - dxNorm; nr.h = d.startRect.h + dyNorm; }
        else if (h === "n") { nr.y = d.startRect.y + dyNorm; nr.h = d.startRect.h - dyNorm; }
        else if (h === "s") { nr.h = d.startRect.h + dyNorm; }
        else if (h === "e") { nr.w = d.startRect.w + dxNorm; }
        else if (h === "w") { nr.x = d.startRect.x + dxNorm; nr.w = d.startRect.w - dxNorm; }
      }
      onRectChange(pageIndex, nr, d.startRect);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pageIndex, onRectChange]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = quadDragRef.current;
      if (!d || !wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / r.width;
      const dy = (e.clientY - d.startY) / r.height;
      const start = d.startQuad[d.pIdx];
      onQuadPoint(pageIndex, d.pIdx, { x: start.x + dx, y: start.y + dy });
    };
    const onUp = () => { quadDragRef.current = null; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pageIndex, onQuadPoint]);

  const showBox = previewCrop && !quad;
  const borderColor = isFullRect(rect) ? "rgba(245,158,11,0.9)" : "#f59e0b";
  const bg = isFullRect(rect) ? "rgba(245,158,11,0.04)" : "rgba(245,158,11,0.12)";
  const showQuad = !!quad;
  const deg = (rotation ?? 0) as number;
  const isSwapped = deg === 90 || deg === 270;

  return (
    <div
      data-page-idx={pageIndex}
      className={`group relative bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all select-none ${isSelected ? "ring-2 ring-emerald-500 border-emerald-500" : "border-gray-200 dark:border-gray-700"}`}
    >
      <div
        ref={wrapRef}
        onDoubleClick={() => onPreview(pageIndex)}
        className={`relative bg-gray-50 dark:bg-gray-900 p-2 overflow-hidden min-h-[160px] flex ${isSwapped ? "items-start justify-start" : "items-center justify-center"}`}
      >
        {!visible ? (
          <div className="text-xs text-gray-400 animate-pulse py-8">Cargando pág. {pageIndex+1}…</div>
        ) : !thumbnailSrc ? (
          <div className="text-xs text-gray-400 animate-pulse py-8">Generando…</div>
        ) : (
          <img
            src={thumbnailSrc}
            alt={`Página ${pageIndex+1}`}
            loading="lazy"
            decoding="async"
            className="max-w-full h-auto object-contain rounded-lg shadow-sm select-none transition-transform duration-200"
            style={{
              width: "100%",
              height: "auto",
              transform: deg ? `rotate(${deg}deg)${isSwapped ? " scale(0.75)" : ""}` : undefined,
              transformOrigin: "center center",
            }}
            draggable={false}
            onDoubleClick={() => onPreview(pageIndex)}
          />
        )}
        {visible && showBox && (
          <div
            data-crop-box="1"
            onPointerDown={(e) => {
              const target = e.target as HTMLElement;
              if (target.dataset.handle) return;
              handlePointerDown(e, "move");
            }}
            className="absolute rounded-sm cursor-move touch-none"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.w * 100}%`,
              height: `${rect.h * 100}%`,
              border: `2px dashed ${borderColor}`,
              background: bg,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
            }}
          >
            {["nw","ne","sw","se","n","s","e","w"].map((pos) => {
              const isCorner = ["nw","ne","sw","se"].includes(pos);
              const style: React.CSSProperties = isCorner
                ? { width: 12, height: 12 }
                : pos === "n" || pos === "s" ? { width: 28, height: 8, borderRadius: 9999 } : { width: 8, height: 28, borderRadius: 9999 };
              const posStyle: Record<string, React.CSSProperties> = {
                nw: { left: -6, top: -6, cursor: "nw-resize" },
                ne: { right: -6, top: -6, cursor: "ne-resize" },
                sw: { left: -6, bottom: -6, cursor: "sw-resize" },
                se: { right: -6, bottom: -6, cursor: "se-resize" },
                n: { left: "50%", top: -4, transform: "translateX(-50%)", cursor: "n-resize" },
                s: { left: "50%", bottom: -4, transform: "translateX(-50%)", cursor: "s-resize" },
                w: { left: -4, top: "50%", transform: "translateY(-50%)", cursor: "w-resize" },
                e: { right: -4, top: "50%", transform: "translateY(-50%)", cursor: "e-resize" },
              };
              return (
                <div
                  key={pos}
                  data-handle={pos}
                  onPointerDown={(e) => handlePointerDown(e, "resize", pos)}
                  className="absolute bg-amber-500 border-2 border-white rounded-sm shadow"
                  style={{ ...style, ...(posStyle[pos] as any), position: "absolute" } as React.CSSProperties}
                />
              );
            })}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full shadow pointer-events-none">Conservar</span>
          </div>
        )}
        {visible && showQuad && quad && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points={quad.map(p=>`${p.x*100},${p.y*100}`).join(" ")}
                fill="rgba(99,102,241,0.12)"
                stroke="rgba(99,102,241,0.95)"
                strokeWidth={0.6}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {quad.map((pt,i)=>(
              <div
                key={i}
                onPointerDown={e=>handleQuadPointerDown(e,i)}
                title={`Esquina ${i+1} — arrastra`}
                className="absolute w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-full shadow -translate-x-1/2 -translate-y-1/2 cursor-move touch-none hover:scale-110 transition-transform"
                style={{ left: `${pt.x*100}%`, top: `${pt.y*100}%` }}
              />
            ))}
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full shadow pointer-events-none">Trapecio → rectángulo</span>
          </>
        )}
        {/* botón flotante expandir — solo hover, no satura footer */}
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(pageIndex); }}
          title="Previsualizar a pantalla completa (alta resolución)"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:scale-105 active:scale-95"
        >
          <span className="text-[11px]">⛶</span>
        </button>
        <span className="absolute top-2 left-2 text-[11px] font-mono font-bold bg-gray-900 text-white px-2 py-1 rounded-full shadow pointer-events-none">{pageIndex + 1}{deg ? ` · ${deg}°` : ""}</span>
        {!showQuad && (
          <>
            <input
              type="checkbox"
              checked={isSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(pageIndex);
              }}
              className="absolute top-2 right-2 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-900"
            />
            <button
              title="Borrar esta página"
              onClick={(e) => { e.stopPropagation(); onDelete(pageIndex); }}
              className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >✕</button>
          </>
        )}
      </div>
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-mono text-gray-600 dark:text-gray-400">Pág. {pageIndex + 1}{deg ? ` · ${deg}°` : ""}{quad ? " · ◫" : ""}</span>
          <div className="flex items-center gap-1">
            <button title="Rotar 90° antihorario" onClick={(e)=>{ e.stopPropagation(); onRotate(pageIndex, -90); }} className="w-7 h-7 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-[11px]">↺</button>
            <button title="Rotar 90° horario" onClick={(e)=>{ e.stopPropagation(); onRotate(pageIndex, 90); }} className="w-7 h-7 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center text-[11px]">↻</button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className={`flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer select-none px-2 py-1 rounded-full border ${isSelected ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600"}`}>
            <input type="checkbox" checked={isSelected} onChange={(e)=>{ e.stopPropagation(); onSelect(pageIndex); }} onClick={e=>e.stopPropagation()} className="rounded text-emerald-600" />
            Seleccionar
          </label>
          <button title="Borrar esta página" onClick={(e)=>{ e.stopPropagation(); onDelete(pageIndex); }} className="px-2.5 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-600 dark:text-gray-300 text-[11px] font-bold">🗑 Borrar</button>
        </div>
        <button onClick={(e)=>{ e.stopPropagation(); onQuadToggle(pageIndex); }} className={`w-full text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border transition-colors ${quad ? "bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600" : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50"}`}>{quad ? "✕ Quitar trapecio" : "◫ Trapecio"}</button>
      </div>
    </div>
  );
});

export default PageCard;
