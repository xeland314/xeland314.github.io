import { DRINKS, META, type Drink } from "../code/codeLines";

export const SEQUENCE_TIMING = {
  assignActive: 500,
  matchActive: 380,
  caseMatched: 480,
  slotLit: 120,
  drop: 550,
  consoleShow: 1000,
  caseScan: 200,
  endPause: 450,
} as const;

export type HighlightState = "active" | "scan" | "matched";

export interface SequenceStep {
  lineId: string | null;
  state: HighlightState | null;
  slot?: Drink;
  dropCan?: boolean;
  console?: string;
  ms: number;
}

export function resolveSequence(drink: Drink): SequenceStep[] {
  const steps: SequenceStep[] = [
    { lineId: "assign", state: "active", ms: SEQUENCE_TIMING.assignActive },
    { lineId: "match", state: "active", ms: SEQUENCE_TIMING.matchActive },
  ];

  for (const candidate of DRINKS) {
    if (candidate === drink) {
      steps.push({
        lineId: `case-${candidate}`,
        state: "matched",
        ms: SEQUENCE_TIMING.caseMatched,
      });
      steps.push({
        lineId: null,
        state: null,
        slot: candidate,
        ms: SEQUENCE_TIMING.slotLit,
      });
      steps.push({
        lineId: `call-${candidate}`,
        state: "matched",
        dropCan: true,
        ms: SEQUENCE_TIMING.drop,
      });
      steps.push({
        lineId: null,
        state: null,
        console: `liberar_bebida("${META[candidate].can} ${META[candidate].name}")`,
        ms: SEQUENCE_TIMING.consoleShow,
      });
      break;
    }
    steps.push({
      lineId: `case-${candidate}`,
      state: "scan",
      ms: SEQUENCE_TIMING.caseScan,
    });
  }

  steps.push({ lineId: null, state: null, ms: SEQUENCE_TIMING.endPause });

  return steps;
}