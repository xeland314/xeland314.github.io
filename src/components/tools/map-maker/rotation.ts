import L from "leaflet";

/**
 * Factor de expansión del bounds al rotar.
 * 0° → 1, 45° → ~1.414, 90° → 1
 */
export function getRotationFactor(rotationDeg: number): number {
  const rad = ((rotationDeg % 360) * Math.PI) / 180;
  return Math.abs(Math.sin(rad)) + Math.abs(Math.cos(rad));
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Corrige un punto de contenedor cuando el mapa está rotado con CSS.
 * El wrapper interior está en `inset -50% 200%` y rotado; su bbox axis-aligned
 * desplaza los clicks. Este helper hace inverse-rotation alrededor del centro visual.
 */
export function correctContainerPoint(
  clientX: number,
  clientY: number,
  rotationDeg: number,
  rotatedDiv: HTMLElement
): L.Point {
  if (rotationDeg % 360 === 0) {
    // fallback simple sin rotación: usa posición relativa al div
    const rect = rotatedDiv.getBoundingClientRect();
    // mapear client → local sin rotar
    // rotatedDiv 200%: su centro visual es rect.center, pero su origen local es (0,0)
    // sin rotación, local = client - rect.left/top (no rotado)
    // con 0° el bbox == div, así que esto funciona
    return L.point(clientX - rect.left, clientY - rect.top);
  }
  const rect = rotatedDiv.getBoundingClientRect();
  const centerScreenX = rect.left + rect.width / 2;
  const centerScreenY = rect.top + rect.height / 2;
  const dx = clientX - centerScreenX;
  const dy = clientY - centerScreenY;
  const rad = (-rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;
  // clientWidth/Height son dimensiones sin rotar del div 200%
  const localX = rotatedDiv.clientWidth / 2 + rx;
  const localY = rotatedDiv.clientHeight / 2 + ry;
  return L.point(localX, localY);
}

export function getCorrectedLatLng(
  map: L.Map,
  clientX: number,
  clientY: number,
  rotationDeg: number
): L.LatLng {
  if (rotationDeg % 360 === 0) {
    // delega a leaflet sin corrección
    const container = map.getContainer();
    const rect = container.getBoundingClientRect();
    const pt = L.point(clientX - rect.left, clientY - rect.top);
    return map.containerPointToLatLng(pt);
  }
  const container = map.getContainer();
  // parent es el div rotado 200% (inset -50%)
  const rotatedDiv = (container.parentElement as HTMLElement) ?? container;
  // si no tiene tamaño (tests), fallback a container
  const target = rotatedDiv.clientWidth > 0 && rotatedDiv.clientHeight > 0 ? rotatedDiv : container;
  const corrected = correctContainerPoint(clientX, clientY, rotationDeg, target);
  return map.containerPointToLatLng(corrected);
}

/**
 * Calcula padding ajustado para fitBounds compensando rotación.
 */
export function getAdjustedPadding(rotationDeg: number): number {
  const f = getRotationFactor(rotationDeg);
  return 0.2 + (f - 1) * 0.55;
}

export function getExtraPadding(rotationDeg: number): [number, number] {
  const f = getRotationFactor(rotationDeg);
  if (f > 1.05) return [Math.round(20 * (f - 1) * 2), Math.round(20 * (f - 1) * 2)];
  return [0, 0];
}

/**
 * Actualiza ángulo desde un puntero alrededor de un elemento circular (perilla).
 * 0° arriba, 90° derecha.
 */
export function angleFromPointer(clientX: number, clientY: number, rect: DOMRect): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return normalizeAngle(Math.round(angle));
}
