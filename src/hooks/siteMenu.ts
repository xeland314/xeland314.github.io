const HEADER_ID = "main-header";
const TOGGLE_ID = "menu-toggle";
const PANEL_ID = "site-menu";
const ICON_OPEN_ID = "icon-open";
const ICON_CLOSE_ID = "icon-close";

function getHeader(): HTMLElement | null {
  return document.getElementById(HEADER_ID);
}

function isOpen(): boolean {
  return getHeader()?.dataset.menuOpen === "true";
}

function setOpen(open: boolean): void {
  const header = getHeader();
  if (!header) return;

  header.dataset.menuOpen = String(open);

  const toggleButton = document.getElementById(TOGGLE_ID);
  toggleButton?.setAttribute("aria-expanded", String(open));

  document.getElementById(ICON_OPEN_ID)?.classList.toggle("hidden", open);
  document.getElementById(ICON_CLOSE_ID)?.classList.toggle("hidden", !open);
}

let delegated = false;

export function initSiteMenu(): void {
  if (typeof document === "undefined" || delegated) return;
  delegated = true;

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest(`#${TOGGLE_ID}`)) {
      setOpen(!isOpen());
      return;
    }

    if (!isOpen()) return;

    const panel = document.getElementById(PANEL_ID);
    if (panel?.contains(target)) {
      if (target.closest("a")) setOpen(false);
      return;
    }

    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) setOpen(false);
  });
}
