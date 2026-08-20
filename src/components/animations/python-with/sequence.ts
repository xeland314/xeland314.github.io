export type WithScenario = "normal" | "error";

export const WITH_TIMING = {
  startPause: 200,
  withPause: 600,
  enterPause: 900,
  queryPause: 1000,
  errorPause: 1100,
  exitPause: 700,
  endPause: 500,
} as const;

export const WITH_FILE = "conexion_db.py";

export interface WithCodeLine {
  id: number;
  html: string;
}

export interface WithLineSpec {
  id: number;
  style: "active" | "accent" | "warn";
}

const WITH_SOURCE: WithCodeLine[] = [
  {
    id: 1,
    html: `<span class="anim-tok-kw">class</span> <span class="anim-tok-fn">ConexionDB</span><span class="anim-tok-mut">:</span>`,
  },
  {
    id: 2,
    html: `    <span class="anim-tok-kw">def</span> <span class="anim-tok-fn">__enter__</span>(self)<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 3,
    html: `        self.<span class="anim-tok-fn">abrir</span>()   <span class="anim-tok-mut"># 1. ABRE CONEXIÓN</span>`,
  },
  {
    id: 4,
    html: `    <span class="anim-tok-kw">def</span> <span class="anim-tok-fn">__exit__</span>(self, *exc)<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 5,
    html: `        self.<span class="anim-tok-fn">cerrar</span>()  <span class="anim-tok-mut"># 3. CIERRA SIEMPRE</span>`,
  },
  { id: 6, html: `` },
  {
    id: 7,
    html: `<span class="anim-tok-acc">with</span> <span class="anim-tok-fn">ConexionDB</span>() <span class="anim-tok-kw">as</span> db<span class="anim-tok-mut">:</span>`,
  },
  {
    id: 8,
    html: `    db.<span class="anim-tok-fn">ejecutar_consulta</span>() <span class="anim-tok-mut"># 2. BLOQUE</span>`,
  },
];

export function buildWithLines(): WithCodeLine[] {
  return WITH_SOURCE.map((line) => ({ ...line }));
}

export function buildWithScenario(mode: WithScenario): WithLineSpec[] {
  return [
    { id: 7, style: "accent" },
    { id: 3, style: "active" },
    { id: 8, style: mode === "normal" ? "active" : "warn" },
    { id: 5, style: "accent" },
  ];
}