import React, { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { processCanvas, clampTolerance, hexToRgb } from "./bgRemover";
import type { BgMode, BgMethod, BgRemoveOptions } from "./bgRemover";

type Item = {
  id: string;
  name: string;
  srcCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  srcUrl: string; // for preview original
  resultCanvas: HTMLCanvasElement | null;
  resultUrl: string | null;
  sizeKB: number;
};

function loadImageToCanvas(file: File): Promise<{ canvas: HTMLCanvasElement; url: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = (img as any).naturalWidth || img.width;
      c.height = (img as any).naturalHeight || img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true } as any)!;
      ctx.drawImage(img, 0, 0);
      // keep url for original preview also use dataUrl maybe big, but revoke later
      resolve({ canvas: c, url, w: c.width, h: c.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function BgRemover() {
  const [items, setItems] = useState<Item[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mode, setMode] = useState<BgMode>("white");
  const [method, setMethod] = useState<BgMethod>("flood");
  const [tolerance, setTolerance] = useState(18);
  const [customHex, setCustomHex] = useState("#00ff00");
  const [feather, setFeather] = useState(0);
  const [trim, setTrim] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compare, setCompare] = useState(50);
  const [showCompare, setShowCompare] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const active = items[activeIdx] ?? null;

  const buildOpts = useCallback((): BgRemoveOptions => ({
    mode,
    tolerance: clampTolerance(tolerance),
    customColor: mode === "custom" ? hexToRgb(customHex) ?? undefined : undefined,
    method,
    feather,
    trim,
  }), [mode, tolerance, customHex, method, feather, trim]);

  const reprocess = useCallback(async (list: Item[], opts: BgRemoveOptions) => {
    setIsProcessing(true);
    // procesar secuencialmente para no bloquear; yield cada iteración
    const next = [...list];
    for (let i = 0; i < next.length; i++) {
      const it = next[i];
      try {
        const resCanvas = processCanvas(it.srcCanvas, opts);
        // exportar a url png (preserva resolución y canal alfa)
        const url = resCanvas.toDataURL("image/png");
        next[i] = { ...it, resultCanvas: resCanvas, resultUrl: url };
      } catch (e) { console.error(e); }
      if (i % 2 === 0) await new Promise(r => setTimeout(r, 0));
    }
    setItems(next);
    setIsProcessing(false);
  }, []);

  // reprocess on opts change
  useEffect(() => {
    if (items.length === 0) return;
    const t = setTimeout(() => reprocess(items, buildOpts()), 160);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, method, tolerance, customHex, feather, trim]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files as any as File[]).filter(f => f.type.startsWith("image/"));
    if (arr.length === 0) { alert("Solo imágenes PNG/JPG/WEBP"); return; }
    if (arr.some(f => f.size > 40 * 1024 * 1024) && !confirm(`Imagen grande >40MB puede consumir memoria. ¿Continuar?`)) return;
    const newItems: Item[] = [];
    for (const f of arr) {
      try {
        const { canvas, url, w, h } = await loadImageToCanvas(f);
        newItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: f.name,
          srcCanvas: canvas,
          width: w, height: h,
          srcUrl: url,
          resultCanvas: null,
          resultUrl: null,
          sizeKB: Math.round(f.size / 1024),
        });
      } catch (e) { console.error(e); }
    }
    if (newItems.length === 0) return;
    const merged = [...items, ...newItems];
    // limit 20 para no OOM
    const capped = merged.slice(0, 20);
    setItems(capped);
    setActiveIdx(0);
    // procesar inmediatamente
    setTimeout(() => reprocess(capped, buildOpts()), 0);
  }, [items, buildOpts, reprocess]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropRef.current?.classList.remove("border-emerald-500", "bg-emerald-50");
    const files = e.dataTransfer.files;
    if (files?.length) handleFiles(files);
  }, [handleFiles]);

  const downloadOne = useCallback((it: Item) => {
    if (!it.resultUrl) return;
    const a = document.createElement("a");
    a.href = it.resultUrl;
    const base = it.name.replace(/\.[^.]+$/, "");
    a.download = `${base}-sin-fondo.png`;
    a.click();
  }, []);

  const downloadAllZip = useCallback(async () => {
    if (items.length === 0) return;
    const zip = new JSZip();
    for (const it of items) {
      if (!it.resultCanvas) continue;
      const dataUrl = it.resultCanvas.toDataURL("image/png");
      const b64 = dataUrl.split(",")[1];
      const base = it.name.replace(/\.[^.]+$/, "");
      zip.file(`${base}-sin-fondo.png`, b64, { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `imagenes-sin-fondo.zip`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, [items]);

  const clearAll = useCallback(() => {
    items.forEach(it => { try { URL.revokeObjectURL(it.srcUrl); } catch {} });
    setItems([]); setActiveIdx(0);
  }, [items]);

  return (
    <div className="w-full max-w-6xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      {/* dropzone */}
      <div
        ref={dropRef}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); dropRef.current?.classList.add("border-emerald-500", "bg-emerald-50"); }}
        onDragLeave={() => dropRef.current?.classList.remove("border-emerald-500", "bg-emerald-50")}
        onDrop={onDrop}
        className="group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 sm:p-10 text-center hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] transition-all cursor-pointer"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">Arrastra imágenes aquí o haz clic</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG · JPG · WEBP · hasta ~40 MB cada una · 100% offline · sin pérdida de resolución</p>
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" multiple className="hidden" onChange={e => { const f = e.target.files; if (f) handleFiles(f); if (fileRef.current) fileRef.current.value = ""; }} />
        {items.length > 0 && (
          <p className="mt-3 text-xs font-mono text-gray-600 dark:text-gray-400">
            {items.length} imagen{items.length>1?"es":""} · {active ? `${active.width}×${active.height} px` : ""} {isProcessing ? "· procesando…" : "· listo"}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-8 space-y-6">
          {/* thumbnails selector si múltiples */}
          {items.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {items.map((it, i) => (
                <button key={it.id} onClick={() => setActiveIdx(i)} className={`shrink-0 rounded-xl overflow-hidden border-2 ${i===activeIdx?"border-violet-500 ring-2 ring-violet-500/20":"border-gray-200 dark:border-gray-700"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.srcUrl} alt={it.name} className="w-20 h-20 object-cover" />
                </button>
              ))}
              <button onClick={downloadAllZip} className="shrink-0 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold self-center">⬇ ZIP ({items.length})</button>
            </div>
          )}

          {/* controles */}
          <div className="p-4 sm:p-5 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest uppercase text-violet-800">Fondo a remover — sin re-escalar</h3>
              <span className="text-[11px] font-mono text-violet-700/70">{active ? `${active.width}×${active.height} · ${active.sizeKB} KB · PNG 1:1` : ""}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Modo</span>
                <select value={mode} onChange={e => setMode(e.target.value as BgMode)} className="w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm">
                  <option value="white">Blanco puro</option>
                  <option value="checker">Blanco + cuadriculado gris</option>
                  <option value="custom">Color personalizado</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Método</span>
                <select value={method} onChange={e => setMethod(e.target.value as BgMethod)} className="w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm">
                  <option value="flood">Solo bordes conectados (recomendado)</option>
                  <option value="global">Todo el lienzo</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pluma / feather</span>
                <select value={feather} onChange={e => setFeather(Number(e.target.value))} className="w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm">
                  <option value={0}>0 — borde nítido</option>
                  <option value={1}>1 — suave</option>
                  <option value={2}>2 — más suave</option>
                </select>
              </label>
            </div>

            {mode === "custom" && (
              <div className="flex items-center gap-3">
                <input type="color" value={customHex} onChange={e => setCustomHex(e.target.value)} className="w-10 h-10 rounded-lg border p-1 bg-white" />
                <input value={customHex} onChange={e => setCustomHex(e.target.value)} placeholder="#00ff00" className="flex-1 rounded-xl border bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono" />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tolerancia {tolerance}</span>
                <span className="text-[11px] text-gray-500">0 = solo idéntico · 60 = muy permisivo</span>
              </div>
              <input type="range" min={0} max={60} value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full accent-violet-600" />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input type="checkbox" checked={trim} onChange={e => setTrim(e.target.checked)} className="rounded text-violet-600" />
                Recortar bordes transparentes (trim)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input type="checkbox" checked={showCompare} onChange={e => setShowCompare(e.target.checked)} className="rounded text-violet-600" />
                Comparar con deslizador
              </label>
              <span className="text-[11px] text-gray-500 ml-auto">Procesado en canvas a resolución nativa — descarga PNG con alfa</span>
            </div>
          </div>

          {/* preview */}
          {active && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">{active.name} · {active.width}×{active.height}</h3>
                <div className="flex gap-2">
                  <button onClick={() => downloadOne(active)} disabled={!active.resultUrl || isProcessing} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold">⬇ Descargar PNG</button>
                  <button onClick={clearAll} className="px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-xs font-semibold">Limpiar</button>
                </div>
              </div>

              {!active.resultUrl ? (
                <div className="py-10 text-center text-xs text-gray-400 animate-pulse border border-dashed rounded-2xl">Procesando a {active.width}×{active.height}…</div>
              ) : showCompare ? (
                <div className="relative rounded-2xl overflow-hidden border bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#f9fafb_0%_50%)_50%_/_20px_20px] dark:bg-[repeating-conic-gradient(#1f2937_0%_25%,#111827_0%_50%)_50%_/_20px_20px]">
                  {/* base original */}
                  <img src={active.srcUrl} alt="original" className="w-full h-auto block select-none" draggable={false} style={{ maxHeight: "65vh", objectFit: "contain" }} />
                  {/* overlay resultado recortado por compare */}
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${compare}%` }}>
                    <img src={active.resultUrl} alt="sin fondo" className="w-full h-full object-contain block select-none" draggable={false} style={{ maxHeight: "65vh", width: "100%" }} />
                  </div>
                  {/* divider */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow" style={{ left: `${compare}%` }} />
                  <input type="range" min={0} max={100} value={compare} onChange={e => setCompare(Number(e.target.value))} className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[60%] accent-violet-600" />
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-1 rounded-full">Original</span>
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-violet-600 text-white px-2 py-1 rounded-full">Sin fondo</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl overflow-hidden border bg-white dark:bg-gray-900 p-2">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-2">Original · {active.width}×{active.height}</p>
                    <img src={active.srcUrl} alt="original" className="w-full h-auto rounded-xl" />
                  </div>
                  <div className="rounded-2xl overflow-hidden border p-2 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#f9fafb_0%_50%)_50%_/_20px_20px]">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-violet-700 mb-2">Sin fondo · PNG alfa · {active.resultCanvas ? `${active.resultCanvas.width}×${active.resultCanvas.height}` : ""}</p>
                    <img src={active.resultUrl} alt="sin fondo" className="w-full h-auto rounded-xl" />
                  </div>
                </div>
              )}
              <p className="text-[11px] text-gray-500">Resolución preservada 1:1 — el canvas de salida tiene las mismas dimensiones que el original{trim ? " (o recortado si activaste trim)" : ""}. Fondo eliminado a píxel sin re-escalar ni comprimir.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
