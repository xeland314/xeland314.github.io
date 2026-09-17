import JSZip from "jszip";

export interface ZipPdfEntry {
  name: string;
  bytes: Uint8Array;
}

export function isZipBytes(bytes: Uint8Array): boolean {
  // PK\x03\x04
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07);
}

export function isPdfBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  return new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
}

export async function extractPdfsFromZip(zipBytes: Uint8Array): Promise<ZipPdfEntry[]> {
  const zip = await JSZip.loadAsync(zipBytes);
  const out: ZipPdfEntry[] = [];
  const entries = Object.values(zip.files).filter((f) => !f.dir && f.name.toLowerCase().endsWith(".pdf"));
  // orden alfabético estable
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const buf = await entry.async("uint8array");
    // valida header PDF, ignora corruptos
    if (buf.length >= 5 && new TextDecoder().decode(buf.slice(0, 5)) === "%PDF-") {
      out.push({ name: entry.name, bytes: buf });
    }
  }
  return out;
}

export async function createZipFromPdfs(entries: ZipPdfEntry[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const e of entries) {
    zip.file(e.name, e.bytes);
  }
  const buf = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  return buf;
}

export async function processZipPdfs(
  zipBytes: Uint8Array,
  processor: (bytes: Uint8Array, name: string, index: number) => Promise<Uint8Array>,
  onProgress?: (done: number, total: number) => void,
): Promise<{ zipBytes: Uint8Array; stats: { original: number; compressed: number }[] }> {
  const entries = await extractPdfsFromZip(zipBytes);
  if (entries.length === 0) throw new Error("ZIP sin PDFs válidos");
  const out: ZipPdfEntry[] = [];
  const stats: { original: number; compressed: number }[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const processed = await processor(e.bytes, e.name, i);
    out.push({ name: e.name, bytes: processed });
    stats.push({ original: e.bytes.length, compressed: processed.length });
    onProgress?.(i + 1, entries.length);
  }
  const outZip = await createZipFromPdfs(out);
  return { zipBytes: outZip, stats };
}

export function formatZipStats(stats: { original: number; compressed: number }[]): string {
  const totalOrig = stats.reduce((s, v) => s + v.original, 0);
  const totalComp = stats.reduce((s, v) => s + v.compressed, 0);
  const saved = totalOrig > 0 ? ((1 - totalComp / totalOrig) * 100).toFixed(1) : "0.0";
  return `${stats.length} PDFs · ${(totalOrig / 1024).toFixed(1)} KB → ${(totalComp / 1024).toFixed(1)} KB · ${saved}%`;
}
