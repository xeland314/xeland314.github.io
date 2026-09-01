import type { NormalizedRect } from "./pdfOperations";

export interface PdfCropSession {
  id: string;
  pdfName: string;
  pdfBase64: string;
  rects: [number, NormalizedRect][];
  selected: number[];
  pageCount: number;
  updatedAt: number;
}

export interface PdfCropProject {
  id: string;
  name: string;
  pdfName: string;
  pdfBase64: string;
  rects: [number, NormalizedRect][];
  selected: number[];
  pageCount: number;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = "PdfCropDB";
const DB_VERSION = 2;
const STORE_SESSION = "sessions";
const STORE_PROJECTS = "projects";
const KEY_CURRENT = "current";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SESSION)) db.createObjectStore(STORE_SESSION);
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) db.createObjectStore(STORE_PROJECTS);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// --- Sesión actual (autosave) ---
export async function saveSession(opts: {
  pdfBytes: Uint8Array;
  pdfName: string;
  rects: Map<number, NormalizedRect>;
  selected: Set<number>;
  pageCount: number;
}): Promise<void> {
  const db = await openDB();
  const session: PdfCropSession = {
    id: KEY_CURRENT,
    pdfName: opts.pdfName,
    pdfBase64: bytesToBase64(opts.pdfBytes),
    rects: Array.from(opts.rects.entries()),
    selected: Array.from(opts.selected),
    pageCount: opts.pageCount,
    updatedAt: Date.now(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SESSION, "readwrite");
    const st = tx.objectStore(STORE_SESSION);
    const req = st.put(session, KEY_CURRENT);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
}

export async function loadSession(): Promise<{
  pdfBytes: Uint8Array;
  pdfName: string;
  rects: Map<number, NormalizedRect>;
  selected: Set<number>;
  pageCount: number;
} | null> {
  const db = await openDB();
  const session = await new Promise<PdfCropSession | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_SESSION, "readonly");
    const st = tx.objectStore(STORE_SESSION);
    const req = st.get(KEY_CURRENT);
    req.onsuccess = () => resolve(req.result as PdfCropSession | undefined);
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  if (!session) return null;
  try {
    return {
      pdfBytes: base64ToBytes(session.pdfBase64),
      pdfName: session.pdfName,
      rects: new Map(session.rects),
      selected: new Set(session.selected),
      pageCount: session.pageCount,
    };
  } catch { return null; }
}

export async function clearSession(): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SESSION, "readwrite");
    const st = tx.objectStore(STORE_SESSION);
    const req = st.delete(KEY_CURRENT);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
}

// --- Mini proyectos (como Cover Creator) ---
function genId(): string {
  try { if (typeof crypto !== "undefined" && "randomUUID" in crypto) return (crypto as any).randomUUID(); } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;
}

export async function listProjects(): Promise<PdfCropProject[]> {
  const db = await openDB();
  const list = await new Promise<PdfCropProject[]>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readonly");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.getAll();
    req.onsuccess = () => resolve((req.result as PdfCropProject[]) || []);
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return list.sort((a,b)=>b.updatedAt-a.updatedAt);
}

export async function getProject(id: string): Promise<PdfCropProject | null> {
  const db = await openDB();
  const proj = await new Promise<PdfCropProject | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readonly");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.get(id);
    req.onsuccess = () => resolve(req.result as PdfCropProject | undefined);
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return proj ?? null;
}

export async function saveProject(opts: {
  name: string;
  pdfBytes: Uint8Array;
  pdfName: string;
  rects: Map<number, NormalizedRect>;
  selected: Set<number>;
  pageCount: number;
  id?: string;
}): Promise<string> {
  const db = await openDB();
  const id = opts.id ?? genId();
  const now = Date.now();
  const existing = opts.id ? await getProject(opts.id) : null;
  const proj: PdfCropProject = {
    id,
    name: opts.name,
    pdfName: opts.pdfName,
    pdfBase64: bytesToBase64(opts.pdfBytes),
    rects: Array.from(opts.rects.entries()),
    selected: Array.from(opts.selected),
    pageCount: opts.pageCount,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.put(proj, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return id;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
}

export async function duplicateProject(id: string): Promise<string | null> {
  const p = await getProject(id);
  if (!p) return null;
  return saveProject({
    name: `${p.name} (copia)`,
    pdfBytes: base64ToBytes(p.pdfBase64),
    pdfName: p.pdfName,
    rects: new Map(p.rects),
    selected: new Set(p.selected),
    pageCount: p.pageCount,
  });
}

export function projectToBytes(proj: PdfCropProject): Uint8Array {
  return base64ToBytes(proj.pdfBase64);
}

export async function exportProjectJson(id: string): Promise<void> {
  const p = await getProject(id);
  if (!p) return;
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${p.name.replace(/[^a-z0-9]/gi,"_")}.pdfcrop.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

export async function importProjectJson(file: File): Promise<string | null> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  // valida campos mínimos
  if (!parsed.pdfBase64 || !parsed.name) throw new Error("JSON inválido");
  const id = genId();
  const proj: PdfCropProject = {
    id,
    name: parsed.name,
    pdfName: parsed.pdfName || "importado.pdf",
    pdfBase64: parsed.pdfBase64,
    rects: parsed.rects || [],
    selected: parsed.selected || [],
    pageCount: parsed.pageCount || 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.put(proj, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return id;
}
