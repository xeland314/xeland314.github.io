import React, { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { parsePageIntervals, normalizedRectToCropBox, FULL_RECT, isFullRect, clampRect } from "./pdfOperations";
import type { NormalizedRect } from "./pdfOperations";
import { syncRectsForSelection, reindexRectsAfterDelete, reindexRectsAfterExtract } from "./cropSync";
import { saveSession, loadSession, clearSession, listProjects, saveProject, getProject, deleteProject, duplicateProject, exportProjectJson, importProjectJson, base64ToBytes } from "./storage";
import type { PdfCropProject } from "./storage";
import PageCard from "./PageCard";
import PreviewModal from "./PreviewModal";
import { generateThumbnails, thumbKey } from "./thumbnail";

type UndoState = { bytes: Uint8Array; rects: Map<number, NormalizedRect>; thumbs: string[] };

const UNDO_LIMIT = 8;
const PERSIST_DEBOUNCE_MS = 1500;
const MAX_AUTOSAVE_BYTES = 25 * 1024 * 1024;

function cloneBytes(b: Uint8Array) { return new Uint8Array(b); }
function cloneRects(m: Map<number, NormalizedRect>) { return new Map(Array.from(m.entries()).map(([k,v])=>[k,{...v}])); }

export default function PdfCropper() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [originalBytes, setOriginalBytes] = useState<Uint8Array | null>(null);
  const [pdfName, setPdfName] = useState("documento.pdf");
  const [pageCount, setPageCount] = useState(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]); // low-res JPEG cache (UI) — original bytes se mantienen para pdf-lib
  const [thumbProgress, setThumbProgress] = useState<{done:number,total:number}|null>(null);
  const thumbCache = useRef<Map<string, string[]>>(new Map());
  const thumbAbort = useRef<AbortController | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [cropRects, setCropRects] = useState<Map<number, NormalizedRect>>(new Map());
  const [previewCrop, setPreviewCrop] = useState(true);
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const [redoStack, setRedoStack] = useState<UndoState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intervalsInput, setIntervalsInput] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState<string|null>(null);
  const [projects, setProjects] = useState<PdfCropProject[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [projectNameInput, setProjectNameInput] = useState("");
  const [previewIdx, setPreviewIdx] = useState<number|null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const persist = useCallback(async (bytes: Uint8Array|null, name: string, rects: Map<number, NormalizedRect>, sel: Set<number>, count: number) => {
    if (!bytes) return;
    if (bytes.length > MAX_AUTOSAVE_BYTES) return;
    try { await saveSession({ pdfBytes: bytes, pdfName: name, rects, selected: sel, pageCount: count }); } catch {}
  }, []);

  const pushUndo = useCallback((bytes: Uint8Array, rects: Map<number, NormalizedRect>, thumbs: string[]) => {
    setUndoStack(s => {
      const next = [...s, { bytes: cloneBytes(bytes), rects: cloneRects(rects), thumbs: [...thumbs] }];
      return next.length > UNDO_LIMIT ? next.slice(next.length - UNDO_LIMIT) : next;
    });
    setRedoStack([]);
  }, []);

  const refreshProjects = useCallback(async () => {
    try { const list = await listProjects(); setProjects(list); } catch { setProjects([]); }
  }, []);

  useEffect(() => { refreshProjects(); }, [refreshProjects]);

  // genera thumbnails low-res con cache (evita re-render forzoso)
  const ensureThumbnails = useCallback(async (bytes: Uint8Array, name: string) => {
    const key = thumbKey(bytes, name);
    const cached = thumbCache.current.get(key);
    if (cached) {
      setThumbnails(cached);
      setPageCount(cached.length);
      return cached;
    }
    thumbAbort.current?.abort();
    const ac = new AbortController();
    thumbAbort.current = ac;
    setThumbProgress({done:0, total:0});
    try {
      const thumbs = await generateThumbnails(bytes, (done,total)=> setThumbProgress({done,total}), ac.signal);
      if (ac.signal.aborted) return thumbs;
      thumbCache.current.set(key, thumbs);
      // LRU simple: máx 5 PDFs en cache memoria
      if (thumbCache.current.size > 5) {
        const first = thumbCache.current.keys().next().value as string;
        thumbCache.current.delete(first);
      }
      setThumbnails(thumbs);
      setPageCount(thumbs.length);
      setThumbProgress(null);
      return thumbs;
    } catch (e:any) {
      if (e?.name !== "AbortError") console.error(e);
      setThumbProgress(null);
      return [];
    }
  }, []);

  // restore session
  useEffect(() => {
    (async () => {
      try {
        const sess = await loadSession();
        if (sess && sess.pdfBytes.length > 5) {
          const h = new TextDecoder().decode(sess.pdfBytes.slice(0,5));
          if (h !== "%PDF-") return;
          setPdfBytes(sess.pdfBytes);
          setOriginalBytes(cloneBytes(sess.pdfBytes));
          setPdfName(sess.pdfName);
          setCropRects(new Map(sess.rects as any));
          setSelected(new Set(sess.selected));
          setPageCount(sess.pageCount);
          // genera thumbnails desde bytes restaurados (cache)
          ensureThumbnails(sess.pdfBytes, sess.pdfName);
        }
      } catch {}
    })();
  }, [ensureThumbnails]);

  // persist
  useEffect(() => {
    if (!pdfBytes) return;
    const t = setTimeout(()=> persist(pdfBytes, pdfName, cropRects, selected, pageCount), PERSIST_DEBOUNCE_MS);
    return ()=> clearTimeout(t);
  }, [pdfBytes, pdfName, cropRects, selected, pageCount, persist]);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) { alert("Solo PDF"); return; }
    if (file.size > 60 * 1024 * 1024) { if (!confirm(`PDF de ${(file.size/1024/1024).toFixed(1)} MB puede ser lento y consumir memoria. ¿Continuar?`)) return; }
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const h = new TextDecoder().decode(bytes.slice(0,5));
    if (h !== "%PDF-") { alert("No es PDF válido"); return; }
    thumbAbort.current?.abort();
    setThumbnails([]);
    setThumbProgress({done:0,total:0});
    setPdfBytes(bytes);
    setOriginalBytes(cloneBytes(bytes));
    setPdfName(file.name);
    setSelected(new Set());
    setCropRects(new Map());
    setUndoStack([]); setRedoStack([]);
    ensureThumbnails(bytes, file.name);
  }, [ensureThumbnails]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const applyIntervals = useCallback(() => {
    const parsed = parsePageIntervals(intervalsInput, pageCount);
    if (parsed.length===0 && intervalsInput.trim()!=="") { alert(`Intervalo no válido. Usa 1-${pageCount}`); return; }
    setSelected(new Set(parsed));
  }, [intervalsInput, pageCount]);

  const deleteSelected = useCallback(async () => {
    if (!pdfBytes || selected.size===0) return;
    if (selected.size===pageCount && !confirm("¿Borrar todas?")) return;
    if (!pdfBytes) return;
    setIsProcessing(true);
    const bytes = cloneBytes(pdfBytes);
    const rects = cloneRects(cropRects);
    const thumbsSnap = [...thumbnails];
    pushUndo(bytes, rects, thumbsSnap);
    try {
      const src = await PDFDocument.load(pdfBytes);
      const kept = Array.from({length: pageCount}, (_,i)=>i).filter(i=>!selected.has(i)).sort((a,b)=>a-b);
      if (kept.length===0) { alert("No puedes dejar PDF sin páginas"); setUndoStack(s=>s.slice(0,-1)); setIsProcessing(false); return; }
      const dst = await PDFDocument.create();
      const copied = await dst.copyPages(src, kept);
      copied.forEach(p=>dst.addPage(p));
      const out = await dst.save();
      const newRects = reindexRectsAfterDelete(cropRects, kept);
      // evita re-render forzoso: splice thumbnails cacheados sin regenerar pdfjs
      const newThumbs = kept.map(idx => thumbnails[idx]).filter(Boolean);
      setPdfBytes(out);
      setThumbnails(newThumbs);
      setPageCount(newThumbs.length);
      // actualiza cache para nuevo bytes
      thumbCache.current.set(thumbKey(out, pdfName), newThumbs);
      setCropRects(newRects);
      setSelected(new Set());
    } catch(e){ console.error(e); alert("Error al borrar"); }
    setIsProcessing(false);
  }, [pdfBytes, selected, pageCount, cropRects, pushUndo, thumbnails, pdfName]);

  const extractSelected = useCallback(async () => {
    if (!pdfBytes || selected.size===0) return;
    setIsProcessing(true);
    const bytes = cloneBytes(pdfBytes);
    const rects = cloneRects(cropRects);
    const thumbsSnap = [...thumbnails];
    pushUndo(bytes, rects, thumbsSnap);
    try {
      const src = await PDFDocument.load(pdfBytes);
      const indices = Array.from(selected).sort((a,b)=>a-b);
      const dst = await PDFDocument.create();
      const copied = await dst.copyPages(src, indices);
      copied.forEach(p=>dst.addPage(p));
      const out = await dst.save();
      const newRects = reindexRectsAfterExtract(cropRects, indices);
      const newThumbs = indices.map(idx => thumbnails[idx]).filter(Boolean);
      setPdfBytes(out);
      setThumbnails(newThumbs);
      setPageCount(newThumbs.length);
      thumbCache.current.set(thumbKey(out, pdfName), newThumbs);
      setCropRects(newRects);
      setSelected(new Set());
    } catch(e){ console.error(e); alert("Error al extraer"); }
    setIsProcessing(false);
  }, [pdfBytes, selected, cropRects, pushUndo, thumbnails, pdfName]);

  const clearCropVisual = useCallback(() => {
    if (cropRects.size === 0) return;
    if (selected.size > 0) {
      const next = new Map(cropRects);
      for (const idx of selected) next.delete(idx);
      setCropRects(next);
    } else {
      setCropRects(new Map());
    }
  }, [cropRects, selected]);

  const handleRectChange = useCallback((idx:number, newRect: NormalizedRect, startRect: NormalizedRect) => {
    setCropRects(prev => {
      const clamped = clampRect(newRect);
      if (selected.has(idx) && selected.size > 1) {
        return syncRectsForSelection(prev, idx, startRect, clamped, selected);
      }
      const next = new Map(prev);
      if (isFullRect(clamped)) next.delete(idx);
      else next.set(idx, clamped);
      return next;
    });
  }, [selected]);

  const handleSelect = useCallback((idx:number)=>{
    setSelected(prev=>{
      const next = new Set(prev);
      if(next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }, []);

  const handleDeleteOne = useCallback(async (idx:number)=>{
    if(!pdfBytes) return;
    setIsProcessing(true);
    const thumbsSnap = [...thumbnails];
    pushUndo(cloneBytes(pdfBytes), cloneRects(cropRects), thumbsSnap);
    try{
      const src = await PDFDocument.load(pdfBytes);
      const kept = Array.from({length: pageCount}, (_,i)=>i).filter(i=>i!==idx);
      if(kept.length===0){ alert("No puedes dejar vacío"); setUndoStack(s=>s.slice(0,-1)); setIsProcessing(false); return; }
      const dst = await PDFDocument.create();
      const copied = await dst.copyPages(src, kept);
      copied.forEach(p=>dst.addPage(p));
      const out = await dst.save();
      const newRects = reindexRectsAfterDelete(cropRects, kept);
      const newThumbs = kept.map(k => thumbnails[k]).filter(Boolean);
      setPdfBytes(out);
      setThumbnails(newThumbs);
      setPageCount(newThumbs.length);
      thumbCache.current.set(thumbKey(out, pdfName), newThumbs);
      setCropRects(newRects);
      setSelected(new Set());
    }catch(e){ console.error(e); }
    setIsProcessing(false);
  }, [pdfBytes, pageCount, cropRects, pushUndo, thumbnails, pdfName]);

  const undo = useCallback(async ()=>{
    if(undoStack.length===0) return;
    const prev = undoStack[undoStack.length-1];
    setUndoStack(s=>s.slice(0,-1));
    if(pdfBytes) setRedoStack(r=>[...r, {bytes: cloneBytes(pdfBytes), rects: cloneRects(cropRects), thumbs: [...thumbnails]}].slice(-UNDO_LIMIT));
    setPdfBytes(cloneBytes(prev.bytes));
    setThumbnails([...prev.thumbs]);
    setPageCount(prev.thumbs.length);
    setCropRects(cloneRects(prev.rects));
    setSelected(new Set());
  }, [undoStack, pdfBytes, cropRects, thumbnails]);

  const redo = useCallback(async ()=>{
    if(redoStack.length===0) return;
    const nxt = redoStack[redoStack.length-1];
    setRedoStack(r=>r.slice(0,-1));
    if(pdfBytes) setUndoStack(s=>[...s, {bytes: cloneBytes(pdfBytes), rects: cloneRects(cropRects), thumbs: [...thumbnails]}].slice(-UNDO_LIMIT));
    setPdfBytes(cloneBytes(nxt.bytes));
    setThumbnails([...nxt.thumbs]);
    setPageCount(nxt.thumbs.length);
    setCropRects(cloneRects(nxt.rects));
    setSelected(new Set());
  }, [redoStack, pdfBytes, cropRects, thumbnails]);

  useEffect(()=>{
    const handler = (e: KeyboardEvent)=>{
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if(!mod) return;
      if(e.key.toLowerCase()==="z" && !e.shiftKey){ e.preventDefault(); undo(); }
      else if((e.key.toLowerCase()==="z" && e.shiftKey) || e.key.toLowerCase()==="y"){ e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return ()=> window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const download = useCallback(async ()=>{
    if(!pdfBytes) return;
    setIsProcessing(true);
    try {
      let outBytes: Uint8Array = pdfBytes;
      const hasCrop = Array.from(cropRects.values()).some(r => !isFullRect(r));
      if (hasCrop) {
        const doc = await PDFDocument.load(pdfBytes);
        for (const [idx, rect] of cropRects.entries()) {
          if (isFullRect(rect)) continue;
          if (idx < 0 || idx >= doc.getPageCount()) continue;
          const page = doc.getPage(idx);
          const media = page.getMediaBox();
          const mw = media.width || page.getSize().width;
          const mh = media.height || page.getSize().height;
          const mx = media.x || 0; const my = media.y || 0;
          const box = normalizedRectToCropBox(rect, mw, mh);
          page.setCropBox(mx + box.x, my + box.y, box.width, box.height);
        }
        outBytes = await doc.save();
      }
      const blob = new Blob([outBytes.slice(0) as any], {type:"application/pdf"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href=url; a.download=`${pdfName.replace(/\.pdf$/i,"")}-recortado.pdf`; a.click();
      setTimeout(()=>URL.revokeObjectURL(url),2000);
    } catch(e){ console.error(e); alert("Error al generar PDF recortado"); }
    setIsProcessing(false);
  }, [pdfBytes, pdfName, cropRects]);

  const handleSaveProject = async ()=>{
    const name = projectNameInput.trim();
    if(!name){ alert("Nombre requerido"); return; }
    if(!pdfBytes){ alert("Carga PDF primero"); return; }
    const id = await saveProject({ name, pdfBytes, pdfName, rects: cropRects, selected, pageCount, id: currentProjectId??undefined });
    setCurrentProjectId(id);
    setProjectNameInput("");
    refreshProjects();
  };
  const handleLoadProject = async (id:string)=>{
    const proj = await getProject(id);
    if(!proj) return;
    let bytes: Uint8Array | null = null;
    if (proj.pdfBytes instanceof Uint8Array) bytes = proj.pdfBytes;
    else if ((proj as any).pdfBytes?.buffer) {
      const ab = (proj as any).pdfBytes; bytes = new Uint8Array(ab.buffer ?? ab);
    } else if (proj.pdfBase64) {
      try { bytes = base64ToBytes(proj.pdfBase64); } catch {}
    }
    if (!bytes) return;
    setPdfBytes(bytes); setOriginalBytes(cloneBytes(bytes)); setPdfName(proj.pdfName);
    setCropRects(new Map(proj.rects as any)); setSelected(new Set(proj.selected));
    setCurrentProjectId(id);
    setShowProjects(false);
    thumbAbort.current?.abort();
    setThumbnails([]);
    ensureThumbnails(bytes, proj.pdfName);
  };
  const handleDeleteProject = async (id:string)=>{
    if(!confirm("¿Eliminar proyecto?")) return;
    await deleteProject(id);
    if(currentProjectId===id) setCurrentProjectId(null);
    refreshProjects();
  };

  return (
    <div className="w-full max-w-6xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="relative mb-6">
        <div className="flex items-center gap-2">
          <button onClick={()=>{setShowProjects(v=>!v); if(!showProjects) refreshProjects();}} className="flex-1 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:border-emerald-500 transition-colors text-left">
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Proyecto actual</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{projects.find(p=>p.id===currentProjectId)?.name ?? (pdfBytes ? `${pdfName} — autosave` : "Sin proyecto — autosave IndexedDB")}</span>
            </div>
            <span className="text-gray-400">▾</span>
          </button>
          <button onClick={()=>{
            if(pdfBytes && !confirm("¿Nuevo proyecto? Se limpiará selección.")) return;
            setCurrentProjectId(null); setSelected(new Set()); setCropRects(new Map());
          }} className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95" title="Nuevo">＋</button>
        </div>
        {showProjects && (
          <>
            <div className="fixed inset-0 z-40" onClick={()=>setShowProjects(false)} />
            <div className="relative z-50 mt-2 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-inner overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex gap-2">
                  <input value={projectNameInput} onChange={e=>setProjectNameInput(e.target.value)} placeholder="Guardar como... (ej: Facturas Q1)" className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button onClick={handleSaveProject} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">Guardar</button>
                </div>
                <div className="flex gap-2">
                  <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={async e=>{
                    const f=e.target.files?.[0]; if(!f) return;
                    try{
                      const id=await importProjectJson(f);
                      if(id){ setCurrentProjectId(id); refreshProjects(); const proj=await getProject(id); if(proj){
                        let bytes: Uint8Array | null = null;
                        if (proj.pdfBytes instanceof Uint8Array) bytes = proj.pdfBytes;
                        else if (proj.pdfBase64) bytes = base64ToBytes(proj.pdfBase64);
                        if(bytes){ setPdfBytes(bytes); setOriginalBytes(cloneBytes(bytes)); setPdfName(proj.pdfName); setCropRects(new Map(proj.rects as any)); setSelected(new Set(proj.selected)); ensureThumbnails(bytes, proj.pdfName); }
                      } }
                    }catch(err){ alert("JSON inválido"); }
                    if(importInputRef.current) importInputRef.current.value="";
                  }} />
                  <button onClick={()=>importInputRef.current?.click()} className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2">Importar JSON</button>
                  <button onClick={async()=>{ if(!confirm("¿Borrar autosave?"))return; await clearSession(); alert("Autosave borrado");}} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border text-xs font-bold uppercase text-gray-500">Limpiar</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {projects.length===0 ? <div className="py-8 text-center text-gray-400 text-xs italic">No hay mini proyectos<br/><span className="text-[11px]">Guarda tu PDF para volver luego sin perder orden ni recortes.</span></div> : projects.map(p=>(
                  <div key={p.id} className={`group flex items-center gap-2 p-2 rounded-lg ${p.id===currentProjectId?"bg-emerald-50 dark:bg-emerald-900/20":"hover:bg-white dark:hover:bg-gray-800"}`}>
                    <button onClick={()=>handleLoadProject(p.id)} className="flex-1 text-left">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-400">{p.pdfName} · {p.pageCount} pág · {new Date(p.updatedAt).toLocaleDateString()}</div>
                    </button>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={async()=>{ const nid=await duplicateProject(p.id); if(nid) refreshProjects();}} className="p-2 text-gray-400 hover:text-emerald-500" title="Duplicar">⎘</button>
                      <button onClick={async()=>{ await exportProjectJson(p.id);}} className="p-2 text-gray-400 hover:text-blue-500" title="Exportar">⬇</button>
                      <button onClick={()=>handleDeleteProject(p.id)} className="p-2 text-gray-400 hover:text-red-500" title="Eliminar">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div
        ref={dropRef}
        onClick={()=>fileInputRef.current?.click()}
        onDragOver={e=>{e.preventDefault(); dropRef.current?.classList.add("border-emerald-500","bg-emerald-50");}}
        onDragLeave={()=>dropRef.current?.classList.remove("border-emerald-500","bg-emerald-50")}
        onDrop={onDrop}
        className="group border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 sm:p-10 text-center hover:border-emerald-500/50 hover:bg-emerald-500/[0.03] transition-all cursor-pointer"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">Arrastra tu PDF aquí o haz clic para seleccionar</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF · hasta ~50 MB · 100% offline · miniaturas cacheadas</p>
        <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleFile(f); }} />
        {pdfBytes && <p className="mt-4 text-xs font-mono text-gray-600 dark:text-gray-400">{pdfName} — {(pdfBytes.length/1024).toFixed(1)} KB · {pageCount} pág {pdfBytes.length > MAX_AUTOSAVE_BYTES && <span className="text-amber-600">· autosave pausado (&gt;25MB)</span>} {thumbProgress && <span className="text-emerald-600">· miniaturas {thumbProgress.done}/{thumbProgress.total}</span>}</p>}
      </div>

      {pdfBytes && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border">{pageCount} páginas</span>
              <span className="text-xs font-mono text-gray-500">{selected.size} seleccionadas</span>
              {isProcessing && <span className="text-xs font-bold text-amber-600 animate-pulse">Procesando…</span>}
              {thumbProgress && thumbProgress.total>0 && <span className="text-xs text-emerald-600 animate-pulse">Miniaturas {thumbProgress.done}/{thumbProgress.total}</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>{ if(undoStack.length) { const prev=undoStack[undoStack.length-1]; setUndoStack(s=>s.slice(0,-1)); setRedoStack(r=>[...r, {bytes: cloneBytes(pdfBytes!), rects: cloneRects(cropRects), thumbs:[...thumbnails]}].slice(-UNDO_LIMIT)); setPdfBytes(cloneBytes(prev.bytes)); setThumbnails([...prev.thumbs]); setPageCount(prev.thumbs.length); setCropRects(cloneRects(prev.rects)); setSelected(new Set()); } }} disabled={undoStack.length===0} className="px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-xs font-semibold disabled:opacity-40">↩ Deshacer</button>
              <button onClick={()=>{ if(redoStack.length===0) return; const nxt=redoStack[redoStack.length-1]; setRedoStack(r=>r.slice(0,-1)); setUndoStack(s=>[...s, {bytes: cloneBytes(pdfBytes!), rects: cloneRects(cropRects), thumbs:[...thumbnails]}].slice(-UNDO_LIMIT)); setPdfBytes(cloneBytes(nxt.bytes)); setThumbnails([...nxt.thumbs]); setPageCount(nxt.thumbs.length); setCropRects(cloneRects(nxt.rects)); setSelected(new Set()); }} disabled={redoStack.length===0} className="px-3 py-2 rounded-xl border bg-white dark:bg-gray-800 text-xs font-semibold disabled:opacity-40">↪ Rehacer</button>
              <button onClick={download} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Descargar PDF</button>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 border rounded-2xl">
            <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">Selección por intervalos</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={intervalsInput} onChange={e=>setIntervalsInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && applyIntervals()} placeholder="Ej: 1-3, 5, 8-10" className="flex-1 bg-gray-50 dark:bg-gray-950 border rounded-xl px-4 py-2.5 text-sm font-mono" />
              <button onClick={applyIntervals} className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold">Aplicar selección</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={()=> setSelected(new Set(Array.from({length: pageCount}, (_,i)=>i)))} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">Seleccionar todo</button>
              <button onClick={()=>{ const n=new Set<number>(); for(let i=0;i<pageCount;i++) if(!selected.has(i)) n.add(i); setSelected(n);}} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">Invertir</button>
              <button onClick={()=> setSelected(new Set())} className="text-xs px-3 py-1.5 rounded-full border hover:bg-gray-50">Limpiar</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={deleteSelected} disabled={selected.size===0 || isProcessing} className="px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-bold disabled:opacity-40">🗑 Borrar seleccionadas</button>
            <button onClick={extractSelected} disabled={selected.size===0 || isProcessing} className="px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-sm font-bold disabled:opacity-40">📄 Conservar solo seleccionadas</button>
            <button onClick={async()=>{ if(!originalBytes) return; const b=cloneBytes(originalBytes); setPdfBytes(b); setCropRects(new Map()); setSelected(new Set()); setUndoStack([]); setRedoStack([]); thumbAbort.current?.abort(); setThumbnails([]); ensureThumbnails(b, pdfName); }} className="px-4 py-3 rounded-xl border bg-white text-sm font-semibold">↺ Volver al original</button>
          </div>

          <div className="p-4 sm:p-5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold tracking-widest uppercase text-amber-800">Recorte visual por página</h3>
              <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={previewCrop} onChange={e=>setPreviewCrop(e.target.checked)} className="rounded" /><span>Vista previa</span></label>
            </div>
            <p className="text-xs text-amber-800/70">Arrastra el <b>marco naranja</b> — el área dentro es el resultado. <b>Sin botón</b>: se aplica al <b>Descargar</b> en resolución original. Si hay varias seleccionadas, se mueven al unísono.</p>
            {cropRects.size > 0 && (
              <div className="mt-3 flex gap-2">
                <button onClick={clearCropVisual} className="px-4 py-2 rounded-xl border bg-white text-xs font-semibold">↺ Quitar recorte {selected.size>0 ? "de seleccionadas" : "de todas"}</button>
                <span className="text-[11px] text-amber-800/60 self-center">{cropRects.size} pág con recorte</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold tracking-widest uppercase text-gray-500">Páginas — arrastra el marco naranja</h3>
              <span className="text-[11px] font-mono text-gray-400">Ctrl+Z deshacer · {UNDO_LIMIT} niveles · miniaturas 180px cacheadas</span>
            </div>
            {thumbnails.length===0 ? (
              <div className="py-8 text-center text-xs text-gray-400 animate-pulse border border-dashed rounded-2xl">Generando miniaturas {thumbProgress ? `${thumbProgress.done}/${thumbProgress.total}` : "…"} — UI baja resolución, PDF original intacto</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[120px]">
                  {thumbnails.map((src, idx) => (
                    <PageCard
                      key={`${pdfName}-thumb-${idx}`}
                      pageIndex={idx}
                      thumbnailSrc={src}
                      rect={cropRects.get(idx) ?? FULL_RECT}
                      isSelected={selected.has(idx)}
                      previewCrop={previewCrop}
                      onSelect={handleSelect}
                      onDelete={handleDeleteOne}
                      onRectChange={handleRectChange}
                      onPreview={setPreviewIdx}
                    />
                  ))}
                </div>
                {previewIdx !== null && pdfBytes && (
                  <PreviewModal
                    pdfBytes={pdfBytes}
                    pageIndex={previewIdx}
                    thumbnailSrc={thumbnails[previewIdx] ?? null}
                    rect={cropRects.get(previewIdx) ?? FULL_RECT}
                    onRectChange={handleRectChange}
                    onClose={() => setPreviewIdx(null)}
                  />
                )}
              </>
            )}
            {pageCount===0 && thumbnails.length===0 && <p className="text-sm text-gray-400 italic py-8 text-center border border-dashed rounded-2xl">Carga un PDF para ver páginas</p>}
          </div>
        </div>
      )}
    </div>
  );
}
