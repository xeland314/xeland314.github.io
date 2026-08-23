import type { SlideData } from "./types";

const md = (id: string, content: string): SlideData => ({
  id,
  type: "markdown",
  content,
});

const fence = (code: string, lang?: string) =>
  "```" + (lang || "") + "\n" + code + "\n```";

/**
 * Convierte un slide del formato antiguo (21 templates) al nuevo
 * formato markdown. Los 4 tipos actuales pasan sin cambios.
 */
export const migrateSlide = (slide: any): SlideData => {
  if (!slide || typeof slide !== "object" || !slide.type) {
    return md(String(Math.random()), "");
  }
  const id = String(slide.id ?? Math.random());
  const title = slide.title ? `## ${slide.title}\n\n` : "";

  switch (slide.type) {
    case "cover":
    case "end":
    case "image":
    case "markdown":
      return slide as SlideData;
    case "step": {
      const parts = [
        slide.stepNumber ? `## ${slide.stepNumber}` : "",
        slide.title,
        slide.description,
      ].filter(Boolean);
      return md(id, parts.join("\n\n"));
    }
    case "list":
    case "takeaways":
      return md(
        id,
        title + (slide.items || []).map((i: string) => `- ${i}`).join("\n")
      );
    case "checklist":
      return md(
        id,
        title +
          (slide.items || [])
            .map((i: any) => `- [${i.checked ? "x" : " "}] ${i.text}`)
            .join("\n")
      );
    case "qna":
      return md(
        id,
        `### ${slide.questionLabel || "Q"}: ${slide.question}\n\n${slide.answer}`
      );
    case "definition":
      return md(
        id,
        `## ${slide.term}${slide.phonetic ? ` ${slide.phonetic}` : ""}\n\n${slide.definition}`
      );
    case "highlight":
      return md(
        id,
        `> ${slide.text}${slide.author ? `\n> \n> — **${slide.author}**` : ""}`
      );
    case "alert":
      return md(id, `> **${slide.title}**\n>\n> ${slide.description}`);
    case "metric":
      return md(id, `# ${slide.value}\n\n${slide.label}${slide.trend ? `\n\n*${slide.trend}*` : ""}`);
    case "comparison":
      return md(
        id,
        title +
          `| ${slide.leftTitle} | ${slide.rightTitle} |\n| --- | --- |\n` +
          zipRows(slide.leftItems, slide.rightItems)
      );
    case "pros-cons":
      return md(
        id,
        title +
          `| ✅ | ❌ |\n| --- | --- |\n` +
          zipRows(slide.pros, slide.cons)
      );
    case "myth-fact":
      return md(id, `${title}**❌ Mito:** ${slide.myth}\n\n**✅ Realidad:** ${slide.fact}`);
    case "timeline":
      return md(
        id,
        title +
          (slide.events || [])
            .map((e: any) => `- **${e.date}** — ${e.title}${e.description ? `: ${e.description}` : ""}`)
            .join("\n")
      );
    case "tech-stack":
      return md(
        id,
        title + (slide.items || []).map((i: any) => `- ${i.icon || ""} **${i.name}**`).join("\n")
      );
    case "code":
      return md(
        id,
        `${title}${fence(slide.code, slide.language)}${slide.description ? `\n\n${slide.description}` : ""}`
      );
    case "mistakes":
      return md(
        id,
        `${title}**❌ ${slide.badLabel || "Mal"}**\n\n${fence(slide.badCode, slide.language)}\n\n**✅ ${slide.goodLabel || "Bien"}**\n\n${fence(slide.goodCode, slide.language)}`
      );
    case "poll":
      return md(
        id,
        `### ${slide.question}\n\n` +
          (slide.options || []).map((o: string) => `- ${o}`).join("\n")
      );
    case "announcement":
      return md(
        id,
        (slide.badge ? `**${slide.badge}**\n\n` : "") +
          title +
          (slide.subtitle || "")
      );
    default: {
      const dump = Object.entries(slide)
        .filter(([k, v]) => k !== "id" && k !== "type" && typeof v === "string" && v)
        .map(([, v]) => v)
        .join("\n\n");
      return md(id, dump);
    }
  }
};

const zipRows = (left: string[] = [], right: string[] = []): string => {
  const n = Math.max(left.length, right.length);
  const rows: string[] = [];
  for (let i = 0; i < n; i++) rows.push(`| ${left[i] || ""} | ${right[i] || ""} |`);
  return rows.join("\n");
};

export const migrateSlides = (slides: unknown): SlideData[] =>
  Array.isArray(slides) && slides.length ? slides.map(migrateSlide) : slides as SlideData[];
