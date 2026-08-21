export type GitMode = "merge" | "rebase";

export const GIT_TIMING = {
  startPause: 200,
  checkoutPause: 600,
  mergePause: 600,
  expandPause: 400,
  mergeNodePause: 600,
  rebaseCheckoutPause: 500,
  detachPause: 800,
  replantF1Pause: 800,
  replantF2Pause: 800,
  rebaseEndPause: 600,
} as const;

export const GIT_FILE: Record<GitMode, string> = {
  merge: "git_merge.sh",
  rebase: "git_rebase.sh",
};

export interface GitCodeLine {
  id: number;
  html: string;
}

export const GIT_CODE: Record<GitMode, GitCodeLine[]> = {
  merge: [
    { id: 1, html: `<span class="anim-tok-git">git</span> checkout main` },
    { id: 2, html: `<span class="anim-tok-git">git</span> merge feature` },
    { id: 3, html: `<span class="anim-tok-mut"># Crea commit de fusión M1</span>` },
    { id: 4, html: `<span class="anim-tok-mut"># Conserva la estructura de ramas</span>` },
  ],
  rebase: [
    { id: 1, html: `<span class="anim-tok-git">git</span> checkout feature` },
    { id: 2, html: `<span class="anim-tok-git">git</span> rebase main` },
    { id: 3, html: `<span class="anim-tok-mut"># Despega F1, F2 y los trasplanta</span>` },
    { id: 4, html: `<span class="anim-tok-mut"># Historial 100% lineal sin M1</span>` },
  ],
};

export function buildGitLines(mode: GitMode): GitCodeLine[] {
  return GIT_CODE[mode].map((line) => ({ ...line }));
}