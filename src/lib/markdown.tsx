import type { ReactNode } from "react";

/**
 * Rendu Markdown minimal et sûr (pas de dangerouslySetInnerHTML) : titres ##,
 * listes à puces "- " et numérotées "1. ", texte en gras **texte**, paragraphes.
 * Suffisant pour le contenu de la base de connaissances, rédigé en interne.
 */
export function renderMarkdown(content: string): ReactNode {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let paragraphBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    const items = listBuffer.map((item, i) => <li key={i}>{renderInline(item)}</li>);
    blocks.push(
      listType === "ol" ? (
        <ol key={`list-${blocks.length}`} className="ml-5 list-decimal space-y-1">
          {items}
        </ol>
      ) : (
        <ul key={`list-${blocks.length}`} className="ml-5 list-disc space-y-1">
          {items}
        </ul>
      ),
    );
    listBuffer = [];
    listType = null;
  }

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-relaxed">
        {renderInline(paragraphBuffer.join(" "))}
      </p>,
    );
    paragraphBuffer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="mt-5 text-base font-semibold text-slate-900 first:mt-0">
          {line.slice(3)}
        </h3>,
      );
    } else if (/^-\s+/.test(line)) {
      flushParagraph();
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(line.replace(/^-\s+/, ""));
    } else if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(line.replace(/^\d+\.\s+/, ""));
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      paragraphBuffer.push(line.trim());
    }
  }
  flushParagraph();
  flushList();

  return <div className="space-y-3 text-sm text-slate-700">{blocks}</div>;
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
