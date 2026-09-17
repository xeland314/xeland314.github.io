import React, { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
import { compressPdf, COMPRESSION_PRESETS, formatSaved } from "../pdf-crop/pdfCompress";
import type { CompressionLevel, CompressStats } from "../pdf-crop/pdfCompress";
import { isZipBytes, extractPdfsFromZip, createZipFromPdfs } from "../shared/zipPdf";
import type { ZipPdfEntry } from "../shared/zipPdf";

type InputKind = "empty" | "pdf" | "zip";

export default function PdfCompressor() {
  const [entries, setEntries] = useState<ZipPdfEntry[]>([]);
  const [inputKind, setInputKind] = useState<InputKind>("empty");
  const [zipName, setZipName] = useState("");
  const [fileIdx, setFileIdx] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [stats, setStats] = useState<CompressStats | null>(null);
  const [zipStats, setZipStats] = useState<{ original: number; compressed: number }[] | null>(null);
  const [previewMode, setPreviewMode] = useState<"original" | "compressed">("original");
  const [previewCompressedUrl, setPreviewCompressedUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<{ origKB: string; compKB: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentEntry = entries[fileIdx] ?? null;

  // render página actual sin miniaturas
  const renderPage = useCallback(async (entry: ZipPdfEntry, page: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const task = pdfjsLib.getDocument({ data: entry.bytes.slice(0) });
    const doc = await task.promise;
    setPageCount(doc.numPages);
    const p = await doc.getPage(page + 1);
    const vp1 = p.getViewport({ scale: 1 });
    const targetW = 900;
    const scale = targetW / vp1.width;
    const vp = p.getViewport({ scale });
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext("2d", { alpha: false }) as any;
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await p.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
    }
    try { p.cleanup(); } catch {}
    try { await doc.destroy(); } catch {}
  }, []);

  useEffect(() => {
    if (!currentEntry) { setPageCount(0); return; }
    const clamped = Math.min(pageIdx, Math.max(0, pageCount - 1 || 0));
    if (clamped !== pageIdx) setPageIdx(clamped);
  }, [currentEntry, pageCount, pageIdx]);

  useEffect(() => {
    if (!currentEntry) return;
    renderPage(currentEntry, pageIdx);
    setPreviewCompressedUrl(null);
    setPreviewSize(null);
    setPreviewMode("original");
  }, [currentEntry, pageIdx, renderPage]);

  // preview comprimido de la hoja actual (estima JPEG) sin generar PDF completo
  const previewCompressed = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentEntry) return;
    // re-render original to canvas already done; encode with preset quality
    const preset = COMPRESSION_PRESETS[compressionLevel];
    // necesita re-render a escala del preset para preview fiel
    const task = pdfjsLib.getDocument({ data: currentEntry.bytes.slice(0) });
    const doc = await task.promise;
    const p = await doc.getPage(pageIdx + 1);
    const vp1 = p.getViewport({ scale: 1 });
    const scale = preset.scale / vp1.width;
    const vp = p.getViewport({ scale });
    const tmp = document.createElement("canvas");
    tmp.width = Math.ceil(vp.width);
    tmp.height = Math.ceil(vp.height);
    const ctx = tmp.getContext("2d", { alpha: false }) as any;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, tmp.width, tmp.height);
    await p.render({ canvasContext: ctx as any, viewport: vp, canvas: tmp } as any).promise;
    try { p.cleanup(); } catch {}
    try { await doc.destroy(); } catch {}
    if (preset.grayscale) {
      try {
        const id = ctx.getImageData(0, 0, tmp.width, tmp.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) { const l = 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; const v=Math.round(l); d[i]=v; d[i+1]=v; d[i+2]=v; }
        ctx.putImageData(id, 0, 0);
      } catch {}
    }
    const origUrl = canvas.toDataURL("image/jpeg", 0.92);
    const compUrl = tmp.toDataURL("image/jpeg", preset.quality);
    // estima KB via base64 length
    const kb = (u: string) => ((u.split(",")[1]?.length ?? 0) * 0.75 / 1024).toFixed(1);
    setPreviewSize({ origKB: kb(origUrl), compKB: kb(compUrl) });
    setPreviewCompressedUrl(compUrl);
    setPreviewMode("compressed");
    // actualiza canvas visible a versión comprimida para comparar
    const c = canvasRef.current;
    if (c) {
      const ctx2 = c.getContext("2d")!;
      c.width = tmp.width; c.height = tmp.height;
      ctx2.drawImage(tmp, 0, 0);
    }
  }, [compressionLevel, currentEntry, pageIdx]);

  const handleFile = useCallback(async (file: File) => {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    if (isZipBytes(bytes)) {
      try {
        const list = await extractPdfsFromZip(bytes);
        if (list.length === 0) { alert("ZIP sin PDFs válidos"); return; }
        setEntries(list);
        setInputKind("zip");
        setZipName(file.name);
        setFileIdx(0); setPageIdx(0); setStats(null); setZipStats(null);
      } catch (e:any) { alert("ZIP inválido: "+e?.message); }
    } else if (bytes[0]===0x25 && bytes[1]===0x50) {
      setEntries([{ name: file.name, bytes }]);
      setInputKind("pdf");
      setZipName("");
      setFileIdx(0); setPageIdx(0); setStats(null); setZipStats(null);
    } else if (file.name.toLowerCase().endsWith(".zip")) {
      alert("ZIP no reconocido");
    } else if (file.name.toLowerCase().endsWith(".pdf")) {
      setEntries([{ name: file.name, bytes }]);
      setInputKind("pdf");
      setFileIdx(0); setPageIdx(0);
    } else { alert("Solo PDF o ZIP con PDFs"); }
  }, []);

  const handleDownload = useCallback(async () => {
    if (entries.length===0) return;
    setIsProcessing(true); setProgress({done:0,total:entries.length}); setStats(null); setZipStats(null);
    try {
      if (inputKind==="zip") {
        const outEntries: ZipPdfEntry[] = [];
        const zstats: { original:number; compressed:number }[] = [];
        for (let i=0;i<entries.length;i++) {
          const e = entries[i];
          const { bytes: out, stats: s } = await compressPdf(e.bytes, { level: compressionLevel }, (d,t)=> setProgress({done:i + d/t, total: entries.length}));
          outEntries.push({ name: e.name.replace(/\.pdf$/i, `-comprimido-${compressionLevel}.pdf`), bytes: out });
          zstats.push({ original: s.originalBytes, compressed: s.compressedBytes });
        }
        const outZip = await createZipFromPdfs(outEntries);
        setZipStats(zstats);
        const blob = new Blob([outZip.slice(0) as any], {type:"application/zip"});
        const url = URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download = zipName.replace(/\.zip$/i,"")+`-comprimido-${compressionLevel}.zip`; a.click();
        setTimeout(()=>URL.revokeObjectURL(url),2000);
      } else {
        const e = entries[0];
        const { bytes: out, stats: s } = await compressPdf(e.bytes, { level: compressionLevel }, (d,t)=> setProgress({done:d,total:t}));
        setStats(s);
        const blob = new Blob([out.slice(0) as any], {type:"application/pdf"});
        const url = URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download = e.name.replace(/\.pdf$/i,"")+`-comprimido-${compressionLevel}.pdf`; a.click();
        setTimeout(()=>URL.revokeObjectURL(url),2000);
      }
    } catch(e:any){ console.error(e); alert("Error al comprimir: "+(e?.message||e));}
    setIsProcessing(false); setProgress(null);
  }, [entries, inputKind, compressionLevel, zipName]);

  const totalOrigKB = entries.reduce((s,e)=>s+e.bytes.length,0)/1024;

  return (
    <div className="w-full max-w-6xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold tracking-widest uppercase text-violet-700">Comprimir PDF — vista hoja por hoja</h2>
        {entries.length>0 && <span className="text-xs font-mono text-gray-500">{entries.length} archivo{entries.length>1?"s":""} · {totalOrigKB.toFixed(1)} KB</span>}
      </div>

      <div
        onClick={()=>fileInputRef.current?.click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault(); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f);}}
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/[0.03] transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 text-white text-lg">🗜</div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">Arrastra PDF o ZIP con PDFs</p>
        <p className="text-xs text-gray-500 mt-1">PDF · ZIP · 100% offline · sin miniaturas</p>
        <input ref={fileInputRef} type="file" accept="application/pdf,.pdf,.zip,application/zip" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleFile(f); if(fileInputRef.current) fileInputRef.current.value="";}} />
        {currentEntry && <p className="mt-3 text-xs font-mono text-gray-600 dark:text-gray-400">{inputKind==="zip" ? `${zipName} · ${entries.length} PDFs` : currentEntry.name} · {pageCount} pág</p>}
      </div>

      {entries.length>0 && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-violet-50 dark:bg-violet-950/20 border border-violet-200 rounded-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-violet-800 mb-2">Nivel de compresión</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.entries(COMPRESSION_PRESETS) as [CompressionLevel, typeof COMPRESSION_PRESETS[CompressionLevel]][]).map(([k,v])=>{
                const sel=compressionLevel===k;
                return (
                  <button key={k} onClick={()=>setCompressionLevel(k)} className={`text-left p-3 rounded-xl border-2 ${sel?"bg-white border-violet-500 shadow-sm":"bg-white/60 border-violet-100 hover:border-violet-300"}`}>
                    <div className="flex justify-between items-start gap-2"><span className={`text-xs font-black ${sel?"text-violet-700":"text-gray-700"}`}>{v.label}</span><span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${sel?"border-violet-600 bg-violet-600":"border-gray-300"}`}>{sel&&<span className="w-1.5 h-1.5 bg-white rounded-full"/>}</span></div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-snug">{v.description}</div>
                    <div className="text-[10px] font-mono text-violet-600 mt-1">{v.requiresRaster?`~${v.scale}px · q${v.quality}${v.grayscale?" · gris":""}`:"vectorial"}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={handleDownload} disabled={isProcessing} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-bold">⬇ Descargar {inputKind==="zip"?"ZIP":"PDF"} comprimido</button>
              <button onClick={previewCompressed} disabled={isProcessing || !currentEntry} className="px-5 py-2.5 rounded-xl border bg-white text-sm font-semibold">👁 Previsualizar esta hoja comprimida</button>
              {isProcessing && progress && <span className="text-xs self-center text-violet-700">{progress.done.toFixed(1)}/{progress.total}</span>}
              {stats && <span className="text-xs font-mono bg-white border px-2.5 py-1 rounded-full text-violet-700">{formatSaved(stats)}</span>}
              {zipStats && <span className="text-xs font-mono bg-white border px-2.5 py-1 rounded-full text-violet-700">{zipStats.reduce((s,v)=>s+v.original,0)/1024|0}→{zipStats.reduce((s,v)=>s+v.compressed,0)/1024|0} KB</span>}
            </div>
            {isProcessing && progress && <div className="mt-2 w-full bg-violet-100 rounded-full h-2 overflow-hidden"><div className="bg-violet-600 h-2 transition-all" style={{width:`${(progress.done/progress.total)*100}%`}}/></div>}
          </div>

          {inputKind==="zip" && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/40 border rounded-2xl">
              <span className="text-xs font-bold text-gray-600 self-center">Archivo en ZIP:</span>
              <select value={fileIdx} onChange={e=>{setFileIdx(Number(e.target.value)); setPageIdx(0);}} className="bg-white dark:bg-gray-900 border rounded-lg px-2 py-2 text-sm min-w-[200px]">
                {entries.map((e,i)=><option key={i} value={i}>{e.name} · {(e.bytes.length/1024).toFixed(1)} KB</option>)}
              </select>
            </div>
          )}

          <div className="border rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-between p-3 border-b bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <button onClick={()=>setPageIdx(p=>Math.max(0,p-1))} disabled={pageIdx===0} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40 text-sm">‹ Anterior</button>
                <span className="text-sm font-mono">Hoja {pageIdx+1} / {pageCount || "—"}</span>
                <button onClick={()=>setPageIdx(p=>Math.min((pageCount-1)||0,p+1))} disabled={pageIdx>=pageCount-1} className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40 text-sm">Siguiente ›</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:inline">{currentEntry?.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${previewMode==="compressed"?"bg-amber-100 text-amber-700 border-amber-200":"bg-gray-100 text-gray-600"}`}>{previewMode==="compressed"?"Vista comprimida":"Original"}</span>
                {previewCompressedUrl && previewMode==="compressed" && <button onClick={()=>{ setPreviewMode("original"); if(currentEntry) renderPage(currentEntry, pageIdx); }} className="text-xs px-2 py-1 rounded-full border bg-white">Ver original</button>}
              </div>
            </div>
            <div className="p-4 flex justify-center bg-white dark:bg-gray-950 min-h-[400px] overflow-auto">
              <canvas ref={canvasRef} className="max-w-full h-auto shadow border" />
            </div>
            {previewSize && previewMode==="compressed" && <div className="p-2 text-center text-xs font-mono text-gray-600 border-t bg-amber-50">Estimación JPEG hoja: {previewSize.origKB} KB → {previewSize.compKB} KB · nivel {compressionLevel}{previewCompressedUrl?" · previsualización raster":""}</div>}
            {!previewCompressedUrl && <div className="p-2 text-center text-xs text-gray-500 border-t">Pulsa “Previsualizar esta hoja comprimida” para ver cómo quedaría sin generar el PDF final. Sin miniaturas.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
