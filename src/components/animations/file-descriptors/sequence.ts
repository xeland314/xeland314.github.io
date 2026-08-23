export type FdStep = "default" | "gt" | "gtgt" | "both";

export const FD_STEPS: FdStep[] = ["default", "gt", "gtgt", "both"];

export const FD_TIMING = {
  introPause: 1800,
  stepPause: 2300,
  settlePause: 600,
  outroPause: 2800,
} as const;

export interface FdCodeLine {
  id: number;
  html: string;
}

export const FD_CODE: FdCodeLine[] = [
  { id: 1, html: `<span class="anim-tok-fn">cmd</span> <span class="anim-tok-mut"># 0←teclado · 1,2→pantalla</span>` },
  { id: 2, html: `<span class="anim-tok-fn">cmd</span> <span class="anim-tok-str">&gt;</span>&nbsp; out.txt <span class="anim-tok-mut"># fd1→archivo</span>` },
  { id: 3, html: `<span class="anim-tok-fn">cmd</span> <span class="anim-tok-num">&gt;&gt;</span> out.txt <span class="anim-tok-mut"># añade al final</span>` },
  { id: 4, html: `<span class="anim-tok-fn">cmd</span> <span class="anim-tok-kw">2&gt;&amp;1</span> <span class="anim-tok-mut"># fd2 duplica a fd1</span>` },
];

export function buildFdLines(): FdCodeLine[] {
  return FD_CODE.map((line) => ({ ...line }));
}

export function estimateFdDemoMs(): number {
  return (
    FD_TIMING.introPause +
    FD_STEPS.length * (FD_TIMING.stepPause + FD_TIMING.settlePause) +
    FD_TIMING.outroPause
  );
}
