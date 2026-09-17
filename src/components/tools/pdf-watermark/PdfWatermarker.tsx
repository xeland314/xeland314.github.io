import React, { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
import { PDFDocument } from "pdf-lib";
import { isZipBytes, extractPdfsFromZip, createZipFromPdfs } from "../shared/zipPdf";
import type { ZipPdfEntry } from "../shared/zipPdf";
import { processWatermarkImage, applyWatermarkToCanvas } from "./watermark";
import type { WatermarkPosition } from "./watermark";
import { clampOpacity, clampScale } from "./watermark";

export default function PdfWatermarker() {
  const [entries, setEntries] = useState<ZipPdfEntry[]>([]);
  const [inputKind, setInputKind] = useState<"empty" | "pdf" | "zip">("empty");
  const [zipName, setZipName] = useState("");
  const [fileIdx, setFileIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [watermarkDataUrl, setWatermarkDataUrl] = useState<string | null>(null);
  const [watermarkCanvas, setWatermarkCanvas] = useState<HTMLCanvasElement | null>(null);
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.18);
  const [scale, setScale] = useState(0.35);
  const [position, setPosition] = useState<WatermarkPosition>("center");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wmInputRef = useRef<HTMLInputElement>(null);

  const currentEntry = entries[fileIdx] ?? null;

  useEffect(() => {
    if (!watermarkDataUrl) { setWatermarkCanvas(null); setWatermarkPreviewUrl(null); return; }
    processWatermarkImage(watermarkDataUrl).then(({ canvas, previewUrl }) => {
      setWatermarkCanvas(canvas as any);
      setWatermarkPreviewUrl(previewUrl);
    }).catch(() => { setWatermarkCanvas(null); setWatermarkPreviewUrl(null); });
  }, [watermarkDataUrl]);

  const renderPage = useCallback(async (entry: ZipPdfEntry, page: number, wmCanvas: HTMLCanvasElement | null, opts: { opacity: number; scale: number; position: WatermarkPosition }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const task = pdfjsLib.getDocument({ data: entry.bytes.slice(0) });
    const doc = await task.promise;
    setPageCount(doc.numPages);
    const p = await doc.getPage(page + 1);
    const vp1 = p.getViewport({ scale: 1 });
    const targetW = 900;
    const sc = targetW / vp1.width;
    const vp = p.getViewport({ scale: sc });
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext("2d", { alpha: false }) as any;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await p.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
    try { p.cleanup(); } catch {}
    try { await doc.destroy(); } catch {}
    if (wmCanvas) {
      applyWatermarkToCanvas(canvas, wmCanvas, { opacity: opts.opacity, scale: opts.scale, position: opts.position });
    }
  }, []);

  useEffect(() => {
    if (!currentEntry) return;
    renderPage(currentEntry, pageIdx, watermarkCanvas, { opacity, scale, position });
  }, [currentEntry, pageIdx, watermarkCanvas, opacity, scale, position, renderPage]);

  const handleFile = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (isZipBytes(bytes)) {
      const list = await extractPdfsFromZip(bytes);
      if (list.length === 0) { alert("ZIP sin PDFs"); return; }
      setEntries(list); setInputKind("zip"); setZipName(file.name); setFileIdx(0); setPageIdx(0);
    } else if (bytes[0] === 0x25) {
      setEntries([{ name: file.name, bytes }]); setInputKind("pdf"); setZipName(""); setFileIdx(0); setPageIdx(0);
    } else { alert("Solo PDF o ZIP con PDFs"); }
  }, []);

  const handleWatermarkFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { alert("Solo imagen"); return; }
    const r = new FileReader(); r.onload = () => setWatermarkDataUrl(r.result as string); r.readAsDataURL(file);
  }, []);

  const handleDownload = useCallback(async () => {
    if (entries.length === 0 || !watermarkCanvas) { alert("Carga PDF y marca de agua"); return; }
    setIsProcessing(true); setProgress({ done: 0, total: entries.length });
    try {
      if (inputKind === "zip") {
        const outEntries: ZipPdfEntry[] = [];
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          const out = await applyWatermarkToPdfBytes(e.bytes, watermarkCanvas!, { opacity, scale, position });
          outEntries.push({ name: e.name.replace(/\.pdf$/i, "-marca.pdf"), bytes: out });
          setProgress({ done: i + 1, total: entries.length });
        }
        const zip = await createZipFromPdfs(outEntries);
        const blob = new Blob([zip.slice(0) as any], { type: "application/zip" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = zipName.replace(/\.zip$/i, "") + "-marca.zip"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else {
        const e = entries[0];
        const out = await applyWatermarkToPdfBytes(e.bytes, watermarkCanvas!, { opacity, scale, position });
        const blob = new Blob([out.slice(0) as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = e.name.replace(/\.pdf$/i, "") + "-marca.pdf"; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (e: any) { console.error(e); alert("Error marca: " + (e?.message || e)); }
    setIsProcessing(false); setProgress(null);
  }, [entries, inputKind, watermarkCanvas, opacity, scale, position, zipName]);

  return (
    <div className="w-full max-w-6xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-sky-700">Marca de agua — hoja por hoja</h2>
        {entries.length > 0 && <span className="text-xs font-mono text-gray-500">{entries.length} archivo{entries.length>1?"s":""} · {pageCount} pág</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f);}}
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/[0.03]"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mx-auto mb-2 text-white">📄</div>
          <p className="text-sm font-bold">PDF o ZIP con PDFs</p>
          <p className="text-xs text-gray-500">Arrastra aquí</p>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf,.zip" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) handleFile(f); if(fileInputRef.current) fileInputRef.current.value="";}} />
          {currentEntry && <p className="mt-2 text-xs font-mono text-gray-600">{inputKind==="zip"?`${zipName} · ${entries.length} PDFs`:currentEntry.name}</p>}
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center mx-auto mb-2 text-white">🖼</div>
          <p className="text-sm font-bold">Marca (imagen con fondo blanco)</p>
          <p className="text-xs text-gray-500">PNG/JPG — blanco se hace transparente</p>
          <input ref={wmInputRef} type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) handleWatermarkFile(f);}} />
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={()=>wmInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold">{watermarkDataUrl?"Cambiar":"Cargar marca"}</button>
            {watermarkDataUrl && <button onClick={()=>{setWatermarkDataUrl(null); if(wmInputRef.current) wmInputRef.current.value="";}} className="px-3 py-2 rounded-xl border bg-white text-xs">Quitar</button>}
          </div>
          {watermarkPreviewUrl && <img src={watermarkPreviewUrl} alt="marca" className="mx-auto mt-3 max-h-16 object-contain border rounded bg-white p-1" style={{opacity}} />}
        </div>
      </div>

      {entries.length>0 && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 rounded-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-sky-800 mb-3">Ajustes marca (previsualización hoja por hoja — sin miniaturas)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1 text-xs">Opacidad {Math.round(opacity*100)}%<input type="range" min={0.05} max={0.9} step={0.05} value={opacity} onChange={e=>setOpacity(clampOpacity(parseFloat(e.target.value)))} /></label>
              <label className="flex flex-col gap-1 text-xs">Tamaño {Math.round(scale*100)}% ancho<input type="range" min={0.1} max={0.6} step={0.05} value={scale} onChange={e=>setScale(clampScale(parseFloat(e.target.value)))} /></label>
              <label className="flex flex-col gap-1 text-xs">Posición
                <select value={position} onChange={e=>setPosition(e.target.value as WatermarkPosition)} className="bg-white dark:bg-gray-800 border rounded-lg px-2 py-2 text-sm">
                  <option value="center">Centro</option>
                  <option value="top-left">Arriba izq</option>
                  <option value="top-right">Arriba der</option>
                  <option value="bottom-left">Abajo izq</option>
                  <option value="bottom-right">Abajo der</option>
                  <option value="tile">Mosaico</option>
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={handleDownload} disabled={isProcessing || !watermarkCanvas} className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-sm font-bold">⬇ Descargar {inputKind==="zip"?"ZIP":"PDF"} con marca</button>
              {isProcessing && progress && <span className="text-xs self-center text-sky-700">{progress.done}/{progress.total}</span>}
            </div>
            {isProcessing && progress && <div className="mt-2 w-full bg-sky-100 rounded-full h-2 overflow-hidden"><div className="bg-sky-600 h-2" style={{width:`${progress.done/progress.total*100}%`}}/></div>}
          </div>

          {inputKind==="zip" && (
            <div className="flex gap-2 p-3 bg-gray-50 border rounded-2xl">
              <span className="text-xs font-bold self-center">Archivo:</span>
              <select value={fileIdx} onChange={e=>{setFileIdx(Number(e.target.value)); setPageIdx(0);}} className="bg-white border rounded-lg px-2 py-2 text-sm flex-1">
                {entries.map((e,i)=><option key={i} value={i}>{e.name}</option>)}
              </select>
            </div>
          )}

          <div className="border rounded-2xl overflow-hidden bg-gray-50">
            <div className="flex items-center justify-between p-3 border-b bg-white">
              <div className="flex gap-2">
                <button onClick={()=>setPageIdx(p=>Math.max(0,p-1))} disabled={pageIdx===0} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">‹ Anterior</button>
                <span className="text-sm font-mono">Hoja {pageIdx+1} / {pageCount||"—"}</span>
                <button onClick={()=>setPageIdx(p=>Math.min((pageCount-1)||0,p+1))} disabled={pageIdx>=pageCount-1} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40">Siguiente ›</button>
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">{currentEntry?.name}</span>
            </div>
            <div className="p-4 flex justify-center bg-white min-h-[400px] overflow-auto">
              <canvas ref={canvasRef} className="max-w-full h-auto shadow border" />
            </div>
            <div className="p-2 text-center text-xs text-gray-500 border-t">Previsualización con marca aplicada — hoja por hoja, sin miniaturas. Usa controles para ajustar y descarga el resultado.</div>
          </div>
        </div>
      )}
    </div>
  );
}

async function applyWatermarkToPdfBytes(pdfBytes: Uint8Array, watermarkCanvas: HTMLCanvasElement, opts: { opacity: number; scale: number; position: WatermarkPosition }): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const dstDoc = await PDFDocument.create();
  const task = pdfjsLib.getDocument({ data: pdfBytes.slice(0) });
  const pdfjsDoc = await task.promise;
  for (let idx = 0; idx < srcDoc.getPageCount(); idx++) {
    const page = await pdfjsDoc.getPage(idx + 1);
    const vp1 = page.getViewport({ scale: 1 });
    const targetW = 1200;
    const scale = targetW / vp1.width;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext("2d", { alpha: false } as any)!;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
    try { page.cleanup(); } catch {}
    // aplica marca
    const wmW = watermarkCanvas.width, wmH = watermarkCanvas.height;
    const scaleW = canvas.width * opts.scale;
    const scaleH = (wmH / wmW) * scaleW;
    ctx.globalAlpha = opts.opacity;
    if (opts.position === "tile") {
      for (let y = 0; y < canvas.height; y += scaleH + 40) for (let x = 0; x < canvas.width; x += scaleW + 40) ctx.drawImage(watermarkCanvas, x, y, scaleW, scaleH);
    } else {
      let x = 0, y = 0;
      if (opts.position === "center") { x = (canvas.width - scaleW) / 2; y = (canvas.height - scaleH) / 2; }
      else if (opts.position === "top-left") { x = 20; y = 20; }
      else if (opts.position === "top-right") { x = canvas.width - scaleW - 20; y = 20; }
      else if (opts.position === "bottom-left") { x = 20; y = canvas.height - scaleH - 20; }
      else if (opts.position === "bottom-right") { x = canvas.width - scaleW - 20; y = canvas.height - scaleH - 20; }
      ctx.drawImage(watermarkCanvas, x, y, scaleW, scaleH);
    }
    ctx.globalAlpha = 1;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const b64 = dataUrl.split(",")[1];
    const jpgBytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const jpg = await dstDoc.embedJpg(jpgBytes);
    const pg = dstDoc.addPage([canvas.width, canvas.height]);
    pg.drawImage(jpg, { x: 0, y: 0, width: canvas.width, height: canvas.height });
  }
  try { await pdfjsDoc.destroy(); } catch {}
  return await dstDoc.save();
}
