// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";
import { initSiteMenu } from "./siteMenu";

function createHeader(): HTMLElement {
  const header = document.createElement("header");
  header.id = "main-header";
  header.dataset.menuOpen = "false";

  const toggle = document.createElement("button");
  toggle.id = "menu-toggle";
  toggle.setAttribute("aria-expanded", "false");
  const iconOpen = document.createElement("span");
  iconOpen.id = "icon-open";
  const iconClose = document.createElement("span");
  iconClose.id = "icon-close";
  iconClose.classList.add("hidden");

  const panel = document.createElement("div");
  panel.id = "site-menu";
  const link = document.createElement("a");
  link.setAttribute("href", "/es/projects");
  panel.append(link);

  header.append(toggle, iconOpen, iconClose, panel);
  document.body.append(header);
  return header;
}

function getHeader(): HTMLElement {
  const header = document.getElementById("main-header");
  if (!header) throw new Error("header not found");
  return header;
}

function click(target: Element): void {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function clickAt(position: "toggle" | "link" | "panel" | "outside"): void {
  const header = getHeader();
  const targets: Record<string, () => Element> = {
    toggle: () => header.querySelector("#menu-toggle")!,
    link: () => header.querySelector("#site-menu a")!,
    panel: () => header.querySelector("#site-menu")!,
    outside: () => document.body,
  };
  click(targets[position]());
}

function pressEscape(): void {
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
}

beforeEach(() => {
  document.body.innerHTML = "";
  initSiteMenu();
});

describe("site menu", () => {
  it("opens and closes from the hamburger toggle", () => {
    const header = createHeader();

    clickAt("toggle");
    expect(header.dataset.menuOpen).toBe("true");
    expect(getHeader().querySelector("#menu-toggle")!.getAttribute("aria-expanded")).toBe("true");
    expect(getHeader().querySelector("#icon-open")!.classList.contains("hidden")).toBe(true);

    clickAt("toggle");
    expect(header.dataset.menuOpen).toBe("false");
    expect(getHeader().querySelector("#menu-toggle")!.getAttribute("aria-expanded")).toBe("false");
    expect(getHeader().querySelector("#icon-close")!.classList.contains("hidden")).toBe(true);
  });

  it("closes when clicking a menu link", () => {
    createHeader();

    clickAt("toggle");
    expect(getHeader().dataset.menuOpen).toBe("true");

    clickAt("link");
    expect(getHeader().dataset.menuOpen).toBe("false");
  });

  it("stays open when clicking inside the panel but outside a link", () => {
    createHeader();

    clickAt("toggle");
    clickAt("panel");
    expect(getHeader().dataset.menuOpen).toBe("true");
  });

  it("closes when clicking outside the header", () => {
    createHeader();

    clickAt("toggle");
    expect(getHeader().dataset.menuOpen).toBe("true");

    clickAt("outside");
    expect(getHeader().dataset.menuOpen).toBe("false");
  });

  it("closes when pressing Escape while open", () => {
    createHeader();

    clickAt("toggle");
    pressEscape();
    expect(getHeader().dataset.menuOpen).toBe("false");

    pressEscape();
    expect(getHeader().dataset.menuOpen).toBe("false");
  });

  it("ignores clicks on other pages elements while closed", () => {
    createHeader();
    const button = document.createElement("button");
    button.className = "ctrl-btn";
    document.body.append(button);

    click(button);
    expect(getHeader().dataset.menuOpen).toBe("false");
  });

  it("keeps working after a client-side navigation swap (ClientRouter)", () => {
    const firstPageHeader = createHeader();

    clickAt("toggle");
    expect(firstPageHeader.dataset.menuOpen).toBe("true");

    firstPageHeader.remove();
    const secondPageHeader = createHeader();
    expect(secondPageHeader.dataset.menuOpen).toBe("false");

    click(secondPageHeader.querySelector("#menu-toggle")!);
    expect(secondPageHeader.dataset.menuOpen).toBe("true");
    expect(
      secondPageHeader.querySelector("#menu-toggle")!.getAttribute(
        "aria-expanded",
      ),
    ).toBe("true");

    clickAt("outside");
    expect(secondPageHeader.dataset.menuOpen).toBe("false");
  });

  it("does not attach duplicate listeners when initialized again", () => {
    createHeader();

    initSiteMenu();
    initSiteMenu();

    clickAt("toggle");
    expect(getHeader().dataset.menuOpen).toBe("true");

    clickAt("toggle");
    expect(getHeader().dataset.menuOpen).toBe("false");
  });
});
