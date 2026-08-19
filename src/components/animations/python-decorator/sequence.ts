export const DECORATOR_TIMING = {
  startPause: 150,
  invokePause: 500,
  beforePause: 800,
  duringPause: 900,
  afterPause: 600,
  donePause: 600,
} as const;

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