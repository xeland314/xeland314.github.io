export type ForkView = "single" | "forked" | "branches";

export const FORK_VIEWS: ForkView[] = ["single", "forked", "branches"];

export const PARENT_PID = 1000;
export const CHILD_PID = 4321;

export const FORK_TIMING = {
  compileRun: 2200,
  beforePrint: 1600,
  forkCall: 2200,
  duplicateAnim: 2600,
  branchStep: 1500,
  returnStep: 1600,
  echoExit: 1600,
  outroPause: 3200,
} as const;

export interface ForkCodeLine {
  id: number;
  html: string;
}

export const FORK_CODE: ForkCodeLine[] = [
  { id: 1, html: `<span class="anim-tok-kw">#include</span> <span class="anim-tok-str">&lt;unistd.h&gt;</span>` },
  { id: 2, html: `<span class="anim-tok-kw">#include</span> <span class="anim-tok-str">&lt;stdio.h&gt;</span>` },
  { id: 3, html: "" },
  { id: 4, html: `<span class="anim-tok-kw">int</span> <span class="anim-tok-fn">main</span>(<span class="anim-tok-kw">void</span>) {` },
  { id: 5, html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-fn">printf</span>(<span class="anim-tok-str">"antes: un solo proceso\\n"</span>);` },
  { id: 6, html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-kw">pid_t</span> pid = <span class="anim-tok-fn">fork</span>();` },
  { id: 7, html: "" },
  { id: 8, html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-kw">if</span> (pid == <span class="anim-tok-num">0</span>) {` },
  { id: 9, html: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-fn">printf</span>(<span class="anim-tok-str">"hijo: pid=%d\\n"</span>, <span class="anim-tok-fn">getpid</span>());` },
  { id: 10, html: `&nbsp;&nbsp;&nbsp;&nbsp;} <span class="anim-tok-kw">else</span> {` },
  { id: 11, html: `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-fn">printf</span>(<span class="anim-tok-str">"padre: hijo=%d\\n"</span>, pid);` },
  { id: 12, html: `&nbsp;&nbsp;&nbsp;&nbsp;}` },
  { id: 13, html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-kw">return</span> <span class="anim-tok-num">0</span>;` },
  { id: 14, html: `}` },
];

export function buildForkLines(): ForkCodeLine[] {
  return FORK_CODE.map((line) => ({ ...line }));
}

const BRANCH_STEPS = 4;

export function estimateForkDemoMs(): number {
  return (
    FORK_TIMING.compileRun +
    FORK_TIMING.beforePrint +
    FORK_TIMING.forkCall +
    FORK_TIMING.duplicateAnim +
    BRANCH_STEPS * FORK_TIMING.branchStep +
    FORK_TIMING.returnStep +
    FORK_TIMING.echoExit +
    FORK_TIMING.outroPause
  );
}
