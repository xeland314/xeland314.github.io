import { state } from "./StateManager";

let dragState: { idx: number; startX: number; startY: number; origX: number; origY: number } | null = null;

export function initDragHandlers() {
  const preview = document.getElementById("seq-preview");
  if (!preview) return;

  preview.querySelectorAll<HTMLElement>("[data-seq-drag]").forEach((el) => {
    el.addEventListener("mousedown", (e) => {
      const idx = parseInt(el.dataset.seqDrag!);
      if (isNaN(idx) || !state.sequence[idx]) return;
      e.preventDefault();
      const tile = state.sequence[idx];
      dragState = {
        idx,
        startX: e.clientX,
        startY: e.clientY,
        origX: tile.x ?? 0,
        origY: tile.y ?? 0,
      };
      el.style.cursor = "grabbing";
    });
  });
}

document.addEventListener("mousemove", (e) => {
  if (!dragState) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  state.sequence[dragState.idx].x = dragState.origX + dx;
  state.sequence[dragState.idx].y = dragState.origY + dy;

  const el = document.querySelector<HTMLElement>(`[data-seq-drag="${dragState.idx}"]`);
  if (el) {
    el.style.left = `${state.sequence[dragState.idx].x}px`;
    el.style.top = `${state.sequence[dragState.idx].y}px`;
  }

  const opInputX = document.querySelector<HTMLInputElement>(`[data-seq-idx="${dragState.idx}"][data-seq-field="x"]`);
  const opInputY = document.querySelector<HTMLInputElement>(`[data-seq-idx="${dragState.idx}"][data-seq-field="y"]`);
  if (opInputX) opInputX.value = String(state.sequence[dragState.idx].x);
  if (opInputY) opInputY.value = String(state.sequence[dragState.idx].y);
});

document.addEventListener("mouseup", () => {
  if (!dragState) return;
  const el = document.querySelector<HTMLElement>(`[data-seq-drag="${dragState.idx}"]`);
  if (el) el.style.cursor = "grab";
  dragState = null;
});
