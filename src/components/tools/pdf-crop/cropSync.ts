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
 * Si el usuario arrastra una página seleccionada, el mismo delta se aplica a las demás seleccionadas.
 */
export function syncRectsForSelection(
  rects: Map<number, NormalizedRect>,
  draggedIdx: number,
  startRect: NormalizedRect,
  newRect: NormalizedRect,
  selected: Set<number>,
): Map<number, NormalizedRect> {
  // Si la página arrastrada no está seleccionada, solo actualiza esa
  if (!selected.has(draggedIdx) || selected.size <= 1) {
    return setRectInMap(rects, draggedIdx, newRect);
  }
  const dx = newRect.x - startRect.x;
  const dy = newRect.y - startRect.y;
  const dw = newRect.w - startRect.w;
  const dh = newRect.h - startRect.h;

  let next = new Map(rects);
  for (const idx of selected) {
    const cur = getRect(rects, idx);
    // Para la página arrastrada usamos newRect directo (ya clampeado)
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
