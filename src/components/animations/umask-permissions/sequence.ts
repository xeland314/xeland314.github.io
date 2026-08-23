export type UmaskMode = "022" | "077";

export const UMASK_TIMING = {
  introPause: 1600,
  defLight: 1300,
  maskShow: 1300,
  groupStep: 1100,
  dirCompute: 1400,
  maskSwap: 1500,
  secondStep: 850,
  outroPause: 3000,
} as const;

export interface UmaskCodeLine {
  id: number;
  html: string;
}

export const UMASK_CODE: UmaskCodeLine[] = [
  { id: 1, html: `<span class="anim-tok-str">$ umask</span> <span class="anim-tok-num">022</span>` },
  { id: 2, html: `<span class="anim-tok-mut">archivo:</span>&nbsp; 666 &amp; ~022 = <span class="anim-tok-str">644</span>` },
  { id: 3, html: `<span class="anim-tok-mut">dir:</span>&nbsp;&nbsp;&nbsp;&nbsp; 777 &amp; ~022 = <span class="anim-tok-str">755</span>` },
  { id: 4, html: `<span class="anim-tok-str">$ umask</span> <span class="anim-tok-num">077</span> <span class="anim-tok-mut">→ 600 / 700</span>` },
];

export function buildUmaskLines(): UmaskCodeLine[] {
  return UMASK_CODE.map((line) => ({ ...line }));
}

const SECOND_PASS_STEPS = 2;

export function estimateUmaskDemoMs(): number {
  return (
    UMASK_TIMING.introPause +
    UMASK_TIMING.defLight +
    UMASK_TIMING.maskShow +
    3 * UMASK_TIMING.groupStep +
    UMASK_TIMING.dirCompute +
    UMASK_TIMING.maskSwap +
    SECOND_PASS_STEPS * UMASK_TIMING.secondStep +
    UMASK_TIMING.outroPause
  );
}
