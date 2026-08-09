import type { Figure, ShapeElement, FillPattern } from "./types";

const PATTERN_DEFS: Record<FillPattern, string> = {
  none: "",
  solid: "",
  hatched:
    '<pattern id="h-{ID}" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="{COLOR}" stroke-width="2"/></pattern>',
  dotted:
    '<pattern id="d-{ID}" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="3" cy="3" r="1.5" fill="{COLOR}"/></pattern>',
  cross:
    '<pattern id="c-{ID}" patternUnits="userSpaceOnUse" width="8" height="8"><path d="M0,0 L8,8 M8,0 L0,8" stroke="{COLOR}" stroke-width="1.5"/></pattern>',
};

const DEFAULT_COLOR = "#33393e";

/** Resuelve el atributo `fill` de un elemento al valor SVG correspondiente. */
export function resolveFill(
  fill: FillPattern,
  color: string = DEFAULT_COLOR,
  id: string,
): string {
  if (fill === "none") return "none";
  if (fill === "solid") return color;
  return `url(#${fill[0]}-${id})`;
}

/** Construye los <defs> necesarios para los patrones usados en la figura. */
export function buildDefs(figure: Figure, color: string = DEFAULT_COLOR): string {
  const used = new Set<FillPattern>();
  figure.elements.forEach((e) => used.add(e.fill));
  const defs: string[] = [];
  let i = 0;
  used.forEach((p) => {
    if (p === "none" || p === "solid") return;
    const template = PATTERN_DEFS[p];
    const id = `${i++}`;
    defs.push(template.replaceAll("{ID}", id).replaceAll("{COLOR}", color));
  });
  return defs.length ? `<defs>${defs.join("")}</defs>` : "";
}

const ELEMENT_RADIUS = 20;

function shapePath(el: ShapeElement, r: number): string {
  const cx = el.x;
  const cy = el.y;
  switch (el.kind) {
    case "circle":
    case "dot":
      return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;
    case "square":
      return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}"/>`;
    case "triangle": {
      const pts = [0, 120, 240].map((a) => {
        const rad = (a * Math.PI) / 180;
        return `${cx + r * Math.sin(rad)},${cy - r * Math.cos(rad)}`;
      });
      return `<polygon points="${pts.join(" ")}"/>`;
    }
    case "pentagon":
    case "hexagon": {
      const sides = el.kind === "pentagon" ? 5 : 6;
      const pts = Array.from({ length: sides }, (_, i) => {
        const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      });
      return `<polygon points="${pts.join(" ")}"/>`;
    }
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const rr = i % 2 === 0 ? r : r * 0.5;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
      });
      return `<polygon points="${pts.join(" ")}"/>`;
    }
    case "line":
      return `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke-width="3"/>`;
  }
}

/** Renderiza un único elemento como string SVG (transformado). */
export function renderElement(
  el: ShapeElement,
  color: string = DEFAULT_COLOR,
  fillId: string,
): string {
  const baseR = el.kind === "dot" ? ELEMENT_RADIUS / 3 : ELEMENT_RADIUS;
  const r = baseR * el.scale;
  const transform = `translate(${el.x} ${el.y}) rotate(${el.rotation}) scale(${el.scale}) translate(${-el.x} ${-el.y})`;
  const path = shapePath({ ...el, x: el.x, y: el.y }, baseR);
  const stroke = el.kind === "line" ? `stroke="${color}" ` : "";
  const fill = el.kind === "line" ? "none" : resolveFill(el.fill, color, fillId);
  return `<g transform="${transform}">${path.replace("/>", ` ${stroke}fill="${fill}"/>`)}</g>`;
}

/** Renderiza una figura completa a un string SVG auto-contenido. */
export function renderFigure(
  figure: Figure,
  color: string = DEFAULT_COLOR,
): string {
  const defs = buildDefs(figure, color);
  const body = figure.elements
    .map((el, i) => renderElement(el, color, `${i}`))
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${figure.width} ${figure.height}">${defs}${body}</svg>`;
}

/** Renderiza varias figuras lado a lado como un único SVG horizontal. */
export function renderSequence(
  figures: Figure[],
  gap: number = 10,
  color: string = DEFAULT_COLOR,
): string {
  if (figures.length === 0) return "";
  const totalW =
    figures.reduce((acc, f) => acc + f.width, 0) + gap * (figures.length - 1);
  const maxH = Math.max(...figures.map((f) => f.height));
  let x = 0;
  const groups = figures.map((f, i) => {
    const g = `<g transform="translate(${x} 0)">${renderFigure(f, color)}</g>`;
    x += f.width + gap;
    return g;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${maxH}">${groups.join("")}</svg>`;
}