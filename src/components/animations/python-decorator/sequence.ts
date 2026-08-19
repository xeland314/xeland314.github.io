export const DECORATOR_TIMING = {
  startPause: 300,
  invokePause: 1400,
  beforePause: 2000,
  duringPause: 2800,
  afterPause: 2200,
  donePause: 1600,
} as const;

export function decoratorTimingTotal(): number {
  return Object.values(DECORATOR_TIMING).reduce((acc, ms) => acc + ms, 0);
}

export const DECORATOR_FILE = "decoradores.py";

export interface DecoratorCodeLine {
  id: number;
  html: string;
}

const DECORATOR_SOURCE: DecoratorCodeLine[] = [
  {
    id: 1,
    html: `<span class="anim-tok-kw">def</span> <span class="anim-tok-fn">medir_tiempo</span>(func)<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 2,
    html: `    <span class="anim-tok-kw">def</span> <span class="anim-tok-fn">wrapper</span>()<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 3,
    html: `        t0 <span class="anim-tok-mut">=</span> time.<span class="anim-tok-fn">time</span>()  <span class="anim-tok-mut"># 1. ANTES</span>`,
  },
  {
    id: 4,
    html: `        res <span class="anim-tok-mut">=</span> <span class="anim-tok-fn">func</span>()      <span class="anim-tok-mut"># 2. DURANTE</span>`,
  },
  {
    id: 5,
    html: `        <span class="anim-tok-fn">print</span>(<span class="anim-tok-str">f"Tiempo: {time()-t0:.2f}s"</span>)`,
  },
  {
    id: 6,
    html: `        <span class="anim-tok-kw">return</span> res        <span class="anim-tok-mut"># 3. DESPUÉS</span>`,
  },
  {
    id: 7,
    html: `<span class="anim-tok-dec">@medir_tiempo</span>`,
  },
  {
    id: 8,
    html: `<span class="anim-tok-kw">def</span> <span class="anim-tok-fn">procesar_datos</span>()<span class="anim-tok-mut">:</span> <span class="anim-tok-str">...</span>`,
  },
];

export function buildDecoratorLines(): DecoratorCodeLine[] {
  return DECORATOR_SOURCE.map((line) => ({ ...line }));
}