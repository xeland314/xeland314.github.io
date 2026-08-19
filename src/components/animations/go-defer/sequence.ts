export const DEFER_TIMING = {
  lineFlash: 260,
  pushPause: 420,
  pushGap: 200,
  popGlow: 380,
  consolePrint: 350,
  popOut: 280,
  popGap: 160,
  printfFlash: 520,
  returnHighlight: 650,
  endPause: 900,
  startPause: 150,
} as const;

export type DeferKind = "db" | "lock" | "log";

export interface DeferMeta {
  label: string;
  color: string;
}

export const DEFER_META: Record<DeferKind, DeferMeta> = {
  db: { label: "cerrando conexión db", color: "var(--anim-defer-db)" },
  lock: { label: "liberando lock", color: "var(--anim-defer-lock)" },
  log: { label: "enviando log", color: "var(--anim-defer-log)" },
};

export const PUSH_ORDER: DeferKind[] = ["db", "lock", "log"];

export const POP_ORDER: DeferKind[] = [...PUSH_ORDER].reverse();

export type DeferLineType = "plain" | "defer" | "blank";

export interface DeferLine {
  id: string;
  type: DeferLineType;
  item?: DeferKind;
  html: string;
}

export function buildDeferLines(): DeferLine[] {
  return [
    {
      id: "func",
      type: "plain",
      html: `<span class="anim-tok-kw">func</span> <span class="anim-tok-fn">processOrder</span>() {`,
    },
    {
      id: "p1",
      type: "plain",
      html: `  <span class="anim-tok-fn">fmt.Println</span>(<span class="anim-tok-str">"abriendo pedido"</span>)`,
    },
    { id: "blank1", type: "blank", html: `` },
    {
      id: "d-db",
      type: "defer",
      item: "db",
      html: `  <span class="anim-tok-kw">defer</span> <span class="anim-tok-fn">fmt.Println</span>(<span class="anim-tok-str">"cerrando conexión db"</span>)`,
    },
    {
      id: "d-lock",
      type: "defer",
      item: "lock",
      html: `  <span class="anim-tok-kw">defer</span> <span class="anim-tok-fn">fmt.Println</span>(<span class="anim-tok-str">"liberando lock"</span>)`,
    },
    {
      id: "d-log",
      type: "defer",
      item: "log",
      html: `  <span class="anim-tok-kw">defer</span> <span class="anim-tok-fn">fmt.Println</span>(<span class="anim-tok-str">"enviando log"</span>)`,
    },
    { id: "blank2", type: "blank", html: `` },
    {
      id: "p2",
      type: "plain",
      html: `  <span class="anim-tok-fn">fmt.Println</span>(<span class="anim-tok-str">"procesando pedido..."</span>)`,
    },
    {
      id: "close",
      type: "plain",
      html: `}  <span class="anim-tok-mut">// return -&gt; ejecuta defers</span>`,
    },
  ];
}

export function deferLineId(item: DeferKind): string {
  return `d-${item}`;
}

export function deferItems(): DeferKind[] {
  return PUSH_ORDER;
}