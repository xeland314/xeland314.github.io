import type { NormalizedRect } from "./pdfOperations";

export type PageRotation = 0 | 90 | 180 | 270;

export interface PdfCropSession {
  id: string;
  pdfName: string;
  pdfBase64: string; // legacy (v2) - se mantiene para compatibilidad import/export
  // v3: guardamos binario directo; si existe, tiene prioridad sobre pdfBase64
  pdfBytes?: Uint8Array;
  rects: [number, NormalizedRect][];
  rotations?: [number, PageRotation][]; // v4 — rotación por página (0|90|180|270), omitido =0
  selected: number[];
  pageCount: number;
  updatedAt: number;
}

export interface PdfCropProject {
  id: string;
  name: string;
  pdfName: string;
  pdfBase64: string; // legacy
  pdfBytes?: Uint8Array; // v3 binario directo
  rects: [number, NormalizedRect][];
  rotations?: [number, PageRotation][]; // v4
  selected: number[];
  pageCount: number;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = "PdfCropDB";
const DB_VERSION = 3;
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

export function bytesToBase64(bytes: Uint8Array): string {
  // chunked para no explotar call stack ni memoria; ~1MB por chunk
  const CHUNK = 1 << 15;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
    // @ts-ignore
    binary += String.fromCharCode.apply(null, slice as any);
  }
  return btoa(binary);
}
export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Obtiene bytes desde sesión/proyecto (soporta legacy base64 y v3 binario)
function extractBytes(obj: PdfCropSession | PdfCropProject): Uint8Array | null {
  if (obj.pdfBytes instanceof Uint8Array) return obj.pdfBytes;
  // Algunos browsers deserializan Uint8Array como ArrayBuffer
  if (obj.pdfBytes && (obj.pdfBytes as any).buffer instanceof ArrayBuffer) {
    const ab = obj.pdfBytes as any;
    if (ab instanceof ArrayBuffer) return new Uint8Array(ab);
    if (ab.buffer) return new Uint8Array(ab.buffer, ab.byteOffset ?? 0, ab.byteLength ?? ab.length);
  }
  if (typeof obj.pdfBase64 === "string" && obj.pdfBase64.length > 0) {
    try { return base64ToBytes(obj.pdfBase64); } catch { return null; }
  }
  return null;
}

// --- Sesión actual (autosave) — guarda binario directo ---
export async function saveSession(opts: {
  pdfBytes: Uint8Array;
  pdfName: string;
  rects: Map<number, NormalizedRect>;
  rotations?: Map<number, PageRotation>;
  selected: Set<number>;
  pageCount: number;
}): Promise<void> {
  const db = await openDB();
  // guardamos binario directo (structured clone), sin base64 para evitar +33% y strings gigantes
  const session: PdfCropSession = {
    id: KEY_CURRENT,
    pdfName: opts.pdfName,
    pdfBase64: "", // legacy vacío
    pdfBytes: opts.pdfBytes, // binario directo
    rects: Array.from(opts.rects.entries()),
    rotations: opts.rotations ? Array.from(opts.rotations.entries()) : [],
    selected: Array.from(opts.selected),
    pageCount: opts.pageCount,
    updatedAt: Date.now(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SESSION, "readwrite");
    const st = tx.objectStore(STORE_SESSION);
    const req = st.put(session as any, KEY_CURRENT);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
}

export async function loadSession(): Promise<{
  pdfBytes: Uint8Array;
  pdfName: string;
  rects: Map<number, NormalizedRect>;
  rotations: Map<number, PageRotation>;
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
    const bytes = extractBytes(session);
    if (!bytes) return null;
    return {
      pdfBytes: bytes,
      pdfName: session.pdfName,
      rects: new Map(session.rects),
      rotations: new Map((session.rotations ?? []) as [number, PageRotation][]),
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
  rotations?: Map<number, PageRotation>;
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
    pdfBase64: "", // legacy vacío
    pdfBytes: opts.pdfBytes,
    rects: Array.from(opts.rects.entries()),
    rotations: opts.rotations ? Array.from(opts.rotations.entries()) : (existing?.rotations ?? []),
    selected: Array.from(opts.selected),
    pageCount: opts.pageCount,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.put(proj as any, id);
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
  const bytes = extractBytes(p);
  if (!bytes) return null;
  return saveProject({
    name: `${p.name} (copia)`,
    pdfBytes: bytes,
    pdfName: p.pdfName,
    rects: new Map(p.rects),
    rotations: new Map((p.rotations ?? []) as [number, PageRotation][]),
    selected: new Set(p.selected),
    pageCount: p.pageCount,
  });
}

export function projectToBytes(proj: PdfCropProject): Uint8Array {
  const b = extractBytes(proj);
  return b ?? new Uint8Array(0);
}

export async function exportProjectJson(id: string): Promise<void> {
  const p = await getProject(id);
  if (!p) return;
  const bytes = extractBytes(p);
  if (!bytes) return;
  // export incluye base64 para portabilidad
  const payload = { ...p, pdfBase64: bytesToBase64(bytes), pdfBytes: undefined };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
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
  if (!parsed.name) throw new Error("JSON inválido");
  let bytes: Uint8Array | null = null;
  if (typeof parsed.pdfBase64 === "string" && parsed.pdfBase64.length > 0) {
    bytes = base64ToBytes(parsed.pdfBase64);
  } else if (parsed.pdfBytes) {
    bytes = extractBytes(parsed as PdfCropProject);
  }
  if (!bytes) throw new Error("JSON sin PDF");
  const id = genId();
  const proj: PdfCropProject = {
    id,
    name: parsed.name,
    pdfName: parsed.pdfName || "importado.pdf",
    pdfBase64: "",
    pdfBytes: bytes,
    rects: parsed.rects || [],
    rotations: parsed.rotations || [],
    selected: parsed.selected || [],
    pageCount: parsed.pageCount || 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, "readwrite");
    const st = tx.objectStore(STORE_PROJECTS);
    const req = st.put(proj as any, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return id;
}
