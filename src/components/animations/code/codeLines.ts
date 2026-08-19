export type Drink = "gaseosa" | "agua" | "limonada";

export const DRINKS: readonly Drink[] = ["gaseosa", "agua", "limonada"];

export interface DrinkMeta {
  str: string;
  can: string;
  name: string;
}

export const META: Record<Drink, DrinkMeta> = {
  gaseosa: { str: "gaseosa", can: "🥤", name: "Gaseosa negra" },
  agua: { str: "agua", can: "💧", name: "Agua natural" },
  limonada: { str: "limonada", can: "🍋", name: "Limonada" },
};

export type CodeLineType = "plain" | "blank" | "case" | "call";

export interface CodeLineDef {
  id: string;
  type: CodeLineType;
  drink?: Drink | null;
  render: (drink: Drink) => string;
}

export const CODE_LINES: readonly CodeLineDef[] = [
  {
    id: "assign",
    type: "plain",
    render: (d) =>
      `<span class="anim-tok-var">bebida</span> <span class="anim-tok-mut">=</span> <span class="anim-tok-str">"${META[d].str}"</span>`,
  },
  { id: "blank1", type: "blank", render: () => "" },
  {
    id: "match",
    type: "plain",
    render: () =>
      `<span class="anim-tok-kw">match</span> bebida<span class="anim-tok-mut">:</span>`,
  },
  {
    id: "case-gaseosa",
    type: "case",
    drink: "gaseosa",
    render: () =>
      `  <span class="anim-tok-kw">case</span> <span class="anim-tok-str">"gaseosa"</span><span class="anim-tok-mut">:</span>`,
  },
  {
    id: "call-gaseosa",
    type: "call",
    drink: "gaseosa",
    render: () =>
      `    <span class="anim-tok-fn">liberar_bebida</span>(<span class="anim-tok-str">"🥤 Gaseosa negra"</span>)`,
  },
  {
    id: "case-agua",
    type: "case",
    drink: "agua",
    render: () =>
      `  <span class="anim-tok-kw">case</span> <span class="anim-tok-str">"agua"</span><span class="anim-tok-mut">:</span>`,
  },
  {
    id: "call-agua",
    type: "call",
    drink: "agua",
    render: () =>
      `    <span class="anim-tok-fn">liberar_bebida</span>(<span class="anim-tok-str">"💧 Agua natural"</span>)`,
  },
  {
    id: "case-limonada",
    type: "case",
    drink: "limonada",
    render: () =>
      `  <span class="anim-tok-kw">case</span> <span class="anim-tok-str">"limonada"</span><span class="anim-tok-mut">:</span>`,
  },
  {
    id: "call-limonada",
    type: "call",
    drink: "limonada",
    render: () =>
      `    <span class="anim-tok-fn">liberar_bebida</span>(<span class="anim-tok-str">"🍋 Limonada"</span>)`,
  },
  {
    id: "case-def",
    type: "case",
    drink: null,
    render: () =>
      `  <span class="anim-tok-kw">case</span> <span class="anim-tok-mut">_</span><span class="anim-tok-mut">:</span>`,
  },
  {
    id: "call-def",
    type: "call",
    drink: null,
    render: () =>
      `    <span class="anim-tok-fn">print</span>(<span class="anim-tok-str">"no disponible"</span>)`,
  },
];

export interface BuiltCodeLine {
  id: string;
  lineNumber: number | null;
  drink: Drink | null;
  html: string;
}

export function buildCodeLines(drink: Drink): BuiltCodeLine[] {
  let counter = 1;
  return CODE_LINES.map((line) => ({
    id: line.id,
    lineNumber: line.type === "blank" ? null : counter++,
    drink: line.drink ?? null,
    html: line.render(drink),
  }));
}

export function renderAssignLine(drink: Drink): string {
  return CODE_LINES[0].render(drink);
}