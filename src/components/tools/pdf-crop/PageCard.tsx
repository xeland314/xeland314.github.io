import React, { useEffect, useRef, useState, memo } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { NormalizedRect } from "./pdfOperations";
import { isFullRect } from "./pdfOperations";

interface Props {
  pageIndex: number; // 0-based
  pdfDoc: PDFDocumentProxy;
  rect: NormalizedRect;
  isSelected: boolean;
  previewCrop: boolean;
  onSelect: (idx: number) => void;
  onDelete: (idx: number) => void;
  onCropOne: (idx: number) => void;
  onRectChange: (idx: number, newRect: NormalizedRect, startRect: NormalizedRect) => void;
}

const PageCard = memo(({ pageIndex, pdfDoc, rect, isSelected, previewCrop, onSelect, onDelete, onCropOne, onRectChange }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState(false);
  const [visible, setVisible] = useState(false); // lazy: solo renderiza cuando entra en viewport
  const dragRef = useRef<null | { type: "move" | "resize"; handle?: string; startX: number; startY: number; startRect: NormalizedRect }>(null);

  // IntersectionObserver lazy - evita renderizar 100 páginas a la vez (OOM canvas)
  useEffect(() => {
    const el = wrapRef.current?.parentElement ?? wrapRef.current;
    if (!el) { setVisible(true); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setVisible(true); io.disconnect(); break; }
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let pageProxy: any = null;
    const render = async () => {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        pageProxy = await pdfDoc.getPage(pageIndex + 1);
        if (cancelled) return;
        const viewport = pageProxy.getViewport({ scale: 1 });
        const scale = 260 / viewport.width;
        const vp = pageProxy.getViewport({ scale });
        const canvas = canvasRef.current!;
        // limpia canvas previo para liberar memoria
        canvas.width = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          await pageProxy.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
        }
        if (wrapRef.current) wrapRef.current.style.aspectRatio = `${vp.width} / ${vp.height}`;
      } catch (e) {
        if (!cancelled) setRenderError(true);
        console.error("render page", pageIndex, e);
      } finally {
        if (pageProxy) try { pageProxy.cleanup(); } catch {}
      }
    };
    render();
    return () => {
      cancelled = true;
      if (pageProxy) try { pageProxy.cleanup(); } catch {}
      // liberar canvas memory al desmontar o cambiar doc
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [pdfDoc, pageIndex, visible]);

  const handlePointerDown = (e: React.PointerEvent, type: "move" | "resize", handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { type, handle, startX: e.clientX, startY: e.clientY, startRect: { ...rect } };
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

  const showBox = previewCrop;
  const borderColor = isFullRect(rect) ? "rgba(245,158,11,0.9)" : "#f59e0b";
  const bg = isFullRect(rect) ? "rgba(245,158,11,0.04)" : "rgba(245,158,11,0.12)";

  return (
    <div
      data-page-idx={pageIndex}
      onClick={() => onSelect(pageIndex)}
      className={`group relative bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer select-none ${isSelected ? "ring-2 ring-emerald-500 border-emerald-500" : "border-gray-200 dark:border-gray-700"}`}
    >
      <div ref={wrapRef} className="relative bg-gray-50 dark:bg-gray-900 p-2 flex items-center justify-center overflow-hidden min-h-[160px]">
        {!visible ? (
          <div className="text-xs text-gray-400 animate-pulse py-8">Cargando pág. {pageIndex+1}…</div>
        ) : renderError ? (
          <div className="text-xs text-red-500 p-4">Error render</div>
        ) : (
          <canvas ref={canvasRef} className="max-w-full h-auto object-contain rounded-lg shadow-sm" style={{ width: "100%", height: "auto" }} />
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
        <span className="absolute top-2 left-2 text-[11px] font-mono font-bold bg-gray-900 text-white px-2 py-1 rounded-full shadow">{pageIndex + 1}</span>
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
        <button
          onClick={(e) => { e.stopPropagation(); onCropOne(pageIndex); }}
          className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >Recortar esta</button>
      </div>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-gray-600 dark:text-gray-400">Pág. {pageIndex + 1}</span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">clic para seleccionar</span>
      </div>
    </div>
  );
});

export default PageCard;
