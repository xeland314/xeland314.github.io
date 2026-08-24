export type ChainScene = "exito" | "rescate" | "regla";

export const CHAIN_TIMING = {
  introPause: 1700,
  typeStep: 700,
  runStep: 1250,
  badgeHold: 1050,
  skipReveal: 1400,
  rescueStep: 1300,
  ruleShow: 2000,
  outroPause: 3400,
} as const;

export interface ChainCodeLine {
  id: number;
  html: string;
}

export const CHAIN_CODE: Record<ChainScene, ChainCodeLine[]> = {
  exito: [
    { id: 1, html: `<span class="anim-tok-str">$ mkdir proyectos</span> <span class="anim-tok-kw">&amp;&amp;</span> <span class="anim-tok-str">cd proyectos</span>` },
    { id: 2, html: `<span class="anim-tok-mut"># los dos corren: exit 0 → la cadena sigue</span>` },
  ],
  rescate: [
    { id: 1, html: `<span class="anim-tok-str">$ ping -c1 servidor &gt; /dev/null</span> <span class="anim-tok-kw">&amp;&amp;</span> <span class="anim-tok-fn">echo</span> <span class="anim-tok-str">"conexión OK"</span>` },
    { id: 2, html: `<span class="anim-tok-kw">||</span> <span class="anim-tok-fn">echo</span> <span class="anim-tok-str">"sin conexión"</span>` },
    { id: 3, html: `<span class="anim-tok-mut"># ping falla → &amp;&amp; omite el eco · || lo rescata</span>` },
  ],
  regla: [
    { id: 1, html: `<span class="anim-tok-kw">&amp;&amp;</span> <span class="anim-tok-mut">avanza solo si el código es 0</span>` },
    { id: 2, html: `<span class="anim-tok-kw">||</span> <span class="anim-tok-mut">actúa solo si es distinto de 0</span>` },
  ],
};

export function buildChainLines(scene: ChainScene): ChainCodeLine[] {
  return CHAIN_CODE[scene].map((line) => ({ ...line }));
}

export function estimateChainDemoMs(): number {
  return (
    CHAIN_TIMING.introPause +
    CHAIN_TIMING.typeStep +
    2 * CHAIN_TIMING.runStep +
    2 * CHAIN_TIMING.badgeHold +
    CHAIN_TIMING.skipReveal +
    CHAIN_TIMING.rescueStep +
    CHAIN_TIMING.ruleShow +
    CHAIN_TIMING.outroPause
  );
}
