import type { RotationOperation } from "./rotador";

export interface RotadorHistoryEntry {
  id: string;
  createdAt: number;
  name: string;
  imageOriginal: string; // dataURL base64
  imageResult: string; // dataURL base64 del resultado final renderizado
  operations: RotationOperation[];
  totalAngle: number;
  normalizedAngle: number;
  formula: string;
  showTrace: boolean;
  includeDirect: boolean;
}

export type NewHistoryEntry = Omit<RotadorHistoryEntry, "id" | "createdAt"> & {
  id?: string;
  createdAt?: number;
};

const DB_NAME = "RotadorHistoryDB";
const DB_VERSION = 1;
const STORE_NAME = "history";
const MAX_ENTRIES = 100;

function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return (crypto as { randomUUID: () => string }).randomUUID();
    }
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function openHistoryDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("IndexedDB blocked"));
  });
}

export async function saveHistoryEntry(entry: NewHistoryEntry): Promise<string> {
  const db = await openHistoryDB();
  const id = entry.id ?? generateId();
  const createdAt = entry.createdAt ?? Date.now();
  const full: RotadorHistoryEntry = {
    ...entry,
    id,
    createdAt,
  } as RotadorHistoryEntry;

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(full);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  // Prune oldest if exceeds MAX_ENTRIES
  try {
    const all = await getHistoryEntries();
    if (all.length > MAX_ENTRIES) {
      const toDelete = all
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(0, all.length - MAX_ENTRIES);
      for (const e of toDelete) {
        await deleteHistoryEntry(e.id);
      }
    }
  } catch {}

  try { db.close(); } catch {}
  return id;
}

export async function getHistoryEntries(): Promise<RotadorHistoryEntry[]> {
  const db = await openHistoryDB();
  const entries = await new Promise<RotadorHistoryEntry[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as RotadorHistoryEntry[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return entries.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const db = await openHistoryDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
}

export async function clearHistory(): Promise<void> {
  const db = await openHistoryDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
}

export async function getHistoryEntry(id: string): Promise<RotadorHistoryEntry | null> {
  const db = await openHistoryDB();
  const entry = await new Promise<RotadorHistoryEntry | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as RotadorHistoryEntry) ?? null);
    req.onerror = () => reject(req.error);
  });
  try { db.close(); } catch {}
  return entry;
}
