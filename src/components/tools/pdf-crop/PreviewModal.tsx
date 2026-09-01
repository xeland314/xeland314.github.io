import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import type { NormalizedRect } from "./pdfOperations";
import { isFullRect } from "./pdfOperations";

if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}

import type { PageRotation } from "./storage";
interface Props {
  pdfBytes: Uint8Array;
  pageIndex: number;
  thumbnailSrc: string | null;
  rect: NormalizedRect;
  rotation?: PageRotation;
  onRectChange: (idx: number, newRect: NormalizedRect, startRect: NormalizedRect) => void;
  onClose: () => void;
}

export default function PreviewModal({ pdfBytes, pageIndex, thumbnailSrc, rect, rotation = 0, onRectChange, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [highResReady, setHighResReady] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const dragRef = useRef<null | { type: "move" | "resize"; handle?: string; startX: number; startY: number; startRect: NormalizedRect }>(null);

  // high-res render solo de esta página, desde bytes originales
  useEffect(() => {
    const ac = new AbortController();
    let doc: any = null;
    let pageProxy: any = null;
    let cancelled = false;
    (async () => {
      try {
        const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
        doc = await task.promise;
        if (ac.signal.aborted || cancelled) return;
        pageProxy = await doc.getPage(pageIndex + 1);
        if (ac.signal.aborted || cancelled) return;
        const viewport = pageProxy.getViewport({ scale: 1 });
        // adapta al monitor: ~90vw / 85vh, máx 1200px ancho para precisión sin OOM
        const maxW = Math.min(window.innerWidth * 0.88, 1200);
        const maxH = window.innerHeight * 0.82;
        const scaleW = maxW / viewport.width;
        const scaleH = maxH / viewport.height;
        const scale = Math.min(scaleW, scaleH, 3); // cap 3x para no explotar
        const vp = pageProxy.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.ceil(vp.width);
        canvas.height = Math.ceil(vp.height);
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await pageProxy.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
        }
        if (wrapRef.current) wrapRef.current.style.aspectRatio = `${vp.width} / ${vp.height}`;
        if (!ac.signal.aborted && !cancelled) setHighResReady(true);
      } catch (e:any) {
        if (e?.name === "AbortError" || ac.signal.aborted) return;
        console.error("preview high-res", e);
        setRenderError(true);
      } finally {
        if (pageProxy) try { pageProxy.cleanup(); } catch {}
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
      if (pageProxy) try { pageProxy.cleanup(); } catch {}
      if (doc) try { doc.destroy(); } catch {}
      if (canvasRef.current) {
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [pdfBytes, pageIndex]);

  // Esc para cerrar
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

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
      const r = wrapRef.current.getBoundingClientRect();
      const dx = (e.clientX - d.startX) / r.width;
      const dy = (e.clientY - d.startY) / r.height;
      let nr: NormalizedRect = { ...d.startRect };
      if (d.type === "move") {
        nr.x = d.startRect.x + dx;
        nr.y = d.startRect.y + dy;
      } else {
        const h = d.handle;
        if (h === "se") { nr.w = d.startRect.w + dx; nr.h = d.startRect.h + dy; }
        else if (h === "nw") { nr.x = d.startRect.x + dx; nr.y = d.startRect.y + dy; nr.w = d.startRect.w - dx; nr.h = d.startRect.h - dy; }
        else if (h === "ne") { nr.y = d.startRect.y + dy; nr.w = d.startRect.w + dx; nr.h = d.startRect.h - dy; }
        else if (h === "sw") { nr.x = d.startRect.x + dx; nr.w = d.startRect.w - dx; nr.h = d.startRect.h + dy; }
        else if (h === "n") { nr.y = d.startRect.y + dy; nr.h = d.startRect.h - dy; }
        else if (h === "s") { nr.h = d.startRect.h + dy; }
        else if (h === "e") { nr.w = d.startRect.w + dx; }
        else if (h === "w") { nr.x = d.startRect.x + dx; nr.w = d.startRect.w - dx; }
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

  const borderColor = isFullRect(rect) ? "rgba(245,158,11,0.95)" : "#f59e0b";
  const bg = isFullRect(rect) ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.14)";

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[min(1200px,88vw)] max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-gray-900 text-white px-2.5 py-1 rounded-full">Pág. {pageIndex + 1}{rotation ? ` · ${rotation}°` : ""}</span>
            <span className="text-xs text-gray-500 hidden sm:inline">Arrastra el marco naranja — precisión a nivel de píxel · <b>Esc</b> para cerrar</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">✕</button>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black p-4 sm:p-6 flex items-center justify-center">
          <div ref={wrapRef} className="relative inline-block max-w-full max-h-full transition-transform duration-200" style={{ transform: rotation ? `rotate(${rotation}deg)` : undefined, transformOrigin: "center center" }}>
            {/* placeholder blur mientras carga high-res */}
            {!highResReady && thumbnailSrc && (
              <img src={thumbnailSrc} alt="" className="absolute inset-0 w-full h-full object-contain rounded-lg blur-[6px] opacity-60 pointer-events-none" />
            )}
            <canvas ref={canvasRef} className="max-w-[88vw] max-h-[72vh] w-auto h-auto object-contain rounded-lg shadow-lg bg-white" style={{ display: highResReady ? "block" : "none" }} />
            {!highResReady && !thumbnailSrc && (
              <div className="w-[480px] h-[640px] max-w-[60vw] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-400">Generando alta resolución…</div>
            )}
            {renderError && <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 bg-white/80 rounded-lg">Error al renderizar página</div>}

            {/* overlay recorte reutilizado */}
            <div
              data-crop-box="1"
              onPointerDown={(e) => {
                const t = e.target as HTMLElement;
                if (t.dataset.handle) return;
                handlePointerDown(e, "move");
              }}
              className="absolute rounded-sm cursor-move touch-none"
              style={{
                left: `${rect.x * 100}%`,
                top: `${rect.y * 100}%`,
                width: `${rect.w * 100}%`,
                height: `${rect.h * 100}%`,
                border: `2.5px dashed ${borderColor}`,
                background: bg,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.38)",
              }}
            >
              {(["nw","ne","sw","se","n","s","e","w"] as const).map((pos) => {
                const isCorner = ["nw","ne","sw","se"].includes(pos);
                const style: React.CSSProperties = isCorner ? { width: 14, height: 14 } : pos === "n" || pos === "s" ? { width: 32, height: 10, borderRadius: 9999 } : { width: 10, height: 32, borderRadius: 9999 };
                const posStyle: Record<string, React.CSSProperties> = {
                  nw: { left: -7, top: -7, cursor: "nw-resize" },
                  ne: { right: -7, top: -7, cursor: "ne-resize" },
                  sw: { left: -7, bottom: -7, cursor: "sw-resize" },
                  se: { right: -7, bottom: -7, cursor: "se-resize" },
                  n: { left: "50%", top: -5, transform: "translateX(-50%)", cursor: "n-resize" },
                  s: { left: "50%", bottom: -5, transform: "translateX(-50%)", cursor: "s-resize" },
                  w: { left: -5, top: "50%", transform: "translateY(-50%)", cursor: "w-resize" },
                  e: { right: -5, top: "50%", transform: "translateY(-50%)", cursor: "e-resize" },
                };
                return <div key={pos} data-handle={pos} onPointerDown={(e) => handlePointerDown(e, "resize", pos)} className="absolute bg-amber-500 border-2 border-white rounded-sm shadow-md" style={{ ...style, ...(posStyle[pos] as any), position: "absolute" } as React.CSSProperties} />;
              })}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow pointer-events-none">Conservar</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 bg-white dark:bg-gray-900">
          <span className="text-[11px] text-gray-500">Solo esta imagen en alta resolución · original intacto para Descargar</span>
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold">Listo</button>
        </div>
      </div>
    </div>
  );
}
