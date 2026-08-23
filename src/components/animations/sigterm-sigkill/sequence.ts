export type SignalMode = "sigterm" | "sigkill";

export const SIG_TIMING = {
  introPause: 1100,
  hopPause: 750,
  deliverPause: 800,
  taskStep: 950,
  exitPause: 1300,
  killFreeze: 600,
  outroPause: 2400,
} as const;

export const MODE_FILE: Record<SignalMode, string> = {
  sigterm: "trap_sigterm.py",
  sigkill: "trap_sigterm.py",
};

export interface SigCodeLine {
  id: number;
  html: string;
}

export const SIG_CODE: Record<SignalMode, SigCodeLine[]> = {
  sigterm: [
    { id: 1, html: `<span class="anim-tok-fn">signal.signal</span>(SIGTERM, handler)` },
    { id: 2, html: `<span class="anim-tok-kw">def</span> <span class="anim-tok-fn">handler</span>(sig, frame)<span class="anim-tok-mut">:</span>` },
    { id: 3, html: `&nbsp;&nbsp;&nbsp;&nbsp;close_sockets()<span class="anim-tok-mut">; flush()</span>` },
    { id: 4, html: `&nbsp;&nbsp;&nbsp;&nbsp;<span class="anim-tok-kw">sys.</span><span class="anim-tok-fn">exit</span>(<span class="anim-tok-num">0</span>)` },
  ],
  sigkill: [
    { id: 1, html: `<span class="anim-tok-mut"># kill -9 NO puede atraparse</span>` },
    { id: 2, html: `<span class="anim-tok-mut"># el kernel destruye el proceso</span>` },
    { id: 3, html: `<span class="anim-tok-mut"># sin handler, sin cleanup,</span>` },
    { id: 4, html: `<span class="anim-tok-mut"># sin posibilidad de despedida</span>` },
  ],
};

export interface CleanupTask {
  id: number;
  label: string;
}

export const CLEANUP_TASKS: CleanupTask[] = [
  { id: 1, label: "cerrar sockets" },
  { id: 2, label: "vaciar buffers" },
  { id: 3, label: "cerrar archivos" },
];

const TERM_STEPS =
  3 * SIG_TIMING.taskStep;

export function buildSigLines(mode: SignalMode): SigCodeLine[] {
  return SIG_CODE[mode].map((line) => ({ ...line }));
}

export function estimateSigDemoMs(): number {
  const term =
    SIG_TIMING.introPause +
    2 * (SIG_TIMING.hopPause + SIG_TIMING.deliverPause) +
    TERM_STEPS +
    SIG_TIMING.exitPause +
    SIG_TIMING.outroPause;
  const kill =
    SIG_TIMING.introPause +
    2 * SIG_TIMING.hopPause +
    SIG_TIMING.killFreeze +
    SIG_TIMING.exitPause +
    SIG_TIMING.outroPause;
  return term + kill;
}
