export type ChmodGroupId = "own" | "grp" | "oth";

export const GROUP_COUNT = 3;

export const CHMOD_TIMING = {
  introPause: 1800,
  groupScan: 1300,
  digitsCompute: 1600,
  chmodLine: 1500,
  xFlip: 1000,
  permUpdate: 1400,
  execDemo: 2200,
  outroPause: 2600,
} as const;

export interface ChmodCodeLine {
  id: number;
  html: string;
}

export const CHMOD_CODE: ChmodCodeLine[] = [
  { id: 1, html: `<span class="anim-tok-str">$ ls -l</span> <span class="anim-tok-var">script.sh</span>` },
  { id: 2, html: `<span class="anim-tok-mut">-</span><span class="anim-tok-str">rw-r--r--</span>&nbsp;&nbsp;→ <span class="anim-tok-num">644</span>` },
  { id: 3, html: `<span class="anim-tok-str">$ chmod</span> <span class="anim-tok-num">755</span> <span class="anim-tok-var">script.sh</span>` },
  { id: 4, html: `<span class="anim-tok-str">$ ls -l</span> <span class="anim-tok-var">script.sh</span>` },
  { id: 5, html: `<span class="anim-tok-mut">-</span><span class="anim-tok-fn">rwxr-xr-x</span>&nbsp;&nbsp;→ <span class="anim-tok-num">755</span>` },
  { id: 6, html: `<span class="anim-tok-str">$ ./script.sh</span> <span class="anim-tok-mut">→ hola desde script.sh</span>` },
];

export function buildChmodLines(): ChmodCodeLine[] {
  return CHMOD_CODE.map((line) => ({ ...line }));
}

export const PERM_BITS_644: readonly number[] = [1, 1, 0, 1, 0, 0, 1, 0, 0];
export const PERM_BITS_755: readonly number[] = [1, 1, 1, 1, 0, 1, 1, 0, 1];

export function bitsToOctalDigit(triple: readonly number[]): number {
  return triple[0] * 4 + triple[1] * 2 + triple[2];
}

export function bitsToLetters(triple: readonly number[]): string {
  const letters = ["r", "w", "x"] as const;
  return letters.map((l, i) => (triple[i] === 1 ? l : "-")).join("");
}

export function bitsToMode(bits: readonly number[]): string {
  const digits: number[] = [];
  for (let g = 0; g < bits.length / 3; g++) {
    digits.push(bitsToOctalDigit(bits.slice(g * 3, g * 3 + 3)));
  }
  return digits.join("");
}

export function estimateChmodDemoMs(): number {
  return (
    CHMOD_TIMING.introPause +
    GROUP_COUNT * CHMOD_TIMING.groupScan +
    CHMOD_TIMING.digitsCompute +
    CHMOD_TIMING.chmodLine +
    GROUP_COUNT * CHMOD_TIMING.xFlip +
    CHMOD_TIMING.permUpdate +
    CHMOD_TIMING.execDemo +
    CHMOD_TIMING.outroPause
  );
}
