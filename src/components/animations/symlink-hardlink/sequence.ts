export const LINK_TIMING = {
  introPause: 2000,
  linkStep: 1500,
  rmPause: 1800,
  nlinkPause: 1200,
  symBreak: 1800,
  catPhase: 1200,
  hardSurvive: 1600,
  outroPause: 3000,
} as const;

export interface LinkCodeLine {
  id: number;
  html: string;
}

export const LINK_CODE: LinkCodeLine[] = [
  { id: 1, html: `<span class="anim-tok-str">$ echo</span> Hola &gt; archivo.txt` },
  { id: 2, html: `<span class="anim-tok-str">$ ln</span>&nbsp;&nbsp;archivo.txt <span class="anim-tok-fn">duro.hlk</span>` },
  { id: 3, html: `<span class="anim-tok-str">$ ln -s</span> archivo.txt <span class="anim-tok-fn">sim.link</span>` },
  { id: 4, html: `<span class="anim-tok-warn">$ rm</span>&nbsp;&nbsp;archivo.txt <span class="anim-tok-mut"># ¿y los datos?</span>` },
];

export function buildLinkLines(): LinkCodeLine[] {
  return LINK_CODE.map((line) => ({ ...line }));
}

export function estimateLinkDemoMs(): number {
  return (
    LINK_TIMING.introPause +
    2 * LINK_TIMING.linkStep +
    LINK_TIMING.rmPause +
    LINK_TIMING.nlinkPause +
    LINK_TIMING.symBreak +
    LINK_TIMING.catPhase +
    LINK_TIMING.hardSurvive +
    LINK_TIMING.outroPause
  );
}
