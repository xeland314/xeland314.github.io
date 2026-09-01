import * as pdfjsLib from "pdfjs-dist";

export function thumbKey(bytes: Uint8Array, name: string): string {
  // hash ligero: nombre + longitud + primeros/últimos 32 bytes, suficiente para cache sesión
  const head = Array.from(bytes.subarray(0, 32)).join(",");
  const tail = bytes.length > 32 ? Array.from(bytes.subarray(bytes.length - 32)).join(",") : "";
  return `${name}::${bytes.length}::${head}::${tail}`;
}

// genera miniaturas low-res JPEG (UI) manteniendo original para pdf-lib
// scale para 180px ancho ~ 0.3x escala real, calidad 0.65 para cache rápido
export async function generateThumbnails(
  bytes: Uint8Array,
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<string[]> {
  const task = pdfjsLib.getDocument({ data: bytes.slice(0) });
  const doc = await task.promise;
  const total = doc.numPages;
  const out: string[] = [];
  for (let i = 1; i <= total; i++) {
    if (signal?.aborted) { try { await doc.destroy(); } catch {} throw new DOMException("Aborted", "AbortError"); }
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    // low-res para UI: 180px ancho (antes 260) -> ~30% menos pixeles, menos memoria
    const scale = 180 / viewport.width;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      // fondo blanco para PDFs transparentes
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx as any, viewport: vp, canvas } as any).promise;
    }
    try { page.cleanup(); } catch {}
    // JPEG 0.6 reduce ~70% vs PNG, decodificación más rápida
    out.push(canvas.toDataURL("image/jpeg", 0.62));
    onProgress?.(i, total);
    // ceder al event loop cada página para no bloquear UI
    await new Promise((r) => setTimeout(r, 0));
  }
  try { await doc.destroy(); } catch {}
  return out;
}
