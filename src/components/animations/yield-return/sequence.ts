export type YieldMode = "return" | "yield";

export const YIELD_TIMING = {
  defPause: 420,
  loopPause: 280,
  appendPause: 480,
  returnPause: 600,
  yieldPause: 600,
  consumePause: 480,
  endPause: 400,
  modePause: 350,
} as const;

export interface YieldCodeLine {
  id: number;
  html: string;
}

const RETURN_SOURCE: YieldCodeLine[] = [
  {
    id: 1,
    html: `<span class="anim-tok-kw">def</span> <span class="anim-tok-fn">obtener_datos</span>()<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 2,
    html: `    lista <span class="anim-tok-mut">=</span> []`,
  },
  {
    id: 3,
    html: `    <span class="anim-tok-kw">for</span> i <span class="anim-tok-kw">in</span> <span class="anim-tok-fn">range</span>(<span class="anim-tok-str">1</span>, <span class="anim-tok-str">5</span>)<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 4,
    html: `        lista.<span class="anim-tok-fn">append</span>(i)`,
  },
  {
    id: 5,
    html: `    <span class="anim-tok-kw">return</span> lista  <span class="anim-tok-mut"># Retorna TODO acumulado</span>`,
  },
];

const YIELD_SOURCE: YieldCodeLine[] = [
  {
    id: 1,
    html: `<span class="anim-tok-kw">def</span> <span class="anim-tok-fn">generar_datos</span>()<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 2,
    html: `    <span class="anim-tok-kw">for</span> i <span class="anim-tok-kw">in</span> <span class="anim-tok-fn">range</span>(<span class="anim-tok-str">1</span>, <span class="anim-tok-str">5</span>)<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 3,
    html: `        <span class="anim-tok-kw">yield</span> i  <span class="anim-tok-mut"># Retorna 1 a 1 y PAUSA</span>`,
  },
  { id: 4, html: `` },
  {
    id: 5,
    html: `<span class="anim-tok-mut"># Consume bajo demanda sin saturar RAM</span>`,
  },
];

export function buildCodeLines(mode: YieldMode): YieldCodeLine[] {
  return (mode === "return" ? RETURN_SOURCE : YIELD_SOURCE).map((l) => ({
    ...l,
  }));
}

export function fileNameFor(mode: YieldMode): string {
  return mode === "return" ? "modo_return.py" : "modo_yield.py";
}

export function modeLabel(mode: YieldMode): string {
  return mode === "return" ? "Modo return (Lista)" : "Modo yield (Generador)";
}