import type { NormalizedRect } from "./pdfOperations";
import { clampRect, FULL_RECT, isFullRect } from "./pdfOperations";

export function getRect(rects: Map<number, NormalizedRect>, idx: number): NormalizedRect {
  return rects.get(idx) ?? { ...FULL_RECT };
}

export function setRectInMap(
  rects: Map<number, NormalizedRect>,
  idx: number,
  rect: NormalizedRect,
): Map<number, NormalizedRect> {
  const next = new Map(rects);
  const clamped = clampRect(rect);
  if (isFullRect(clamped)) next.delete(idx);
  else next.set(idx, clamped);
  return next;
}

/**
 * Sincroniza el movimiento de recorte al unísono para todas las páginas seleccionadas.
 * FIX OOM/exagerado: antes usaba total delta (newRect - startRect) sumado a `cur` ya movido,
 * lo que triplicaba el movimiento en la 2ª/3ª actualización. Ahora usa delta incremental
 * respecto al valor previo de la página arrastrada (prevDragged) para que cada pointermove
 * aplique solo el incremento de ese frame.
 */
export function syncRectsForSelection(
  rects: Map<number, NormalizedRect>,
  draggedIdx: number,
  startRect: NormalizedRect,
  newRect: NormalizedRect,
  selected: Set<number>,
): Map<number, NormalizedRect> {
  if (!selected.has(draggedIdx) || selected.size <= 1) {
    return setRectInMap(rects, draggedIdx, newRect);
  }
  // delta incremental: compara con el valor previo (prevDragged), no con startRect total
  const prevDragged = getRect(rects, draggedIdx);
  // fallback si no había rect previo (FULL_RECT no guardado): usa startRect
  const base = rects.has(draggedIdx) ? prevDragged : startRect;
  const dx = newRect.x - base.x;
  const dy = newRect.y - base.y;
  const dw = newRect.w - base.w;
  const dh = newRect.h - base.h;

  let next = new Map(rects);
  for (const idx of selected) {
    const cur = getRect(rects, idx);
    if (idx === draggedIdx) {
      next = setRectInMap(next, idx, newRect);
    } else {
      const synced: NormalizedRect = {
        x: cur.x + dx,
        y: cur.y + dy,
        w: cur.w + dw,
        h: cur.h + dh,
      };
      next = setRectInMap(next, idx, synced);
    }
  }
  return next;
}

/**
 * Reindexa rects después de borrar páginas.
 * keeps = índices que se conservan en orden
 */
export function reindexRectsAfterDelete(
  rects: Map<number, NormalizedRect>,
  keptIndices: number[],
): Map<number, NormalizedRect> {
  const next = new Map<number, NormalizedRect>();
  keptIndices.forEach((oldIdx, newIdx) => {
    const r = rects.get(oldIdx);
    if (r) next.set(newIdx, { ...r });
  });
  return next;
}

export function reindexRectsAfterExtract(
  rects: Map<number, NormalizedRect>,
  extractedIndices: number[],
): Map<number, NormalizedRect> {
  const next = new Map<number, NormalizedRect>();
  extractedIndices.forEach((oldIdx, newIdx) => {
    const r = rects.get(oldIdx);
    if (r) next.set(newIdx, { ...r });
  });
  return next;
}
