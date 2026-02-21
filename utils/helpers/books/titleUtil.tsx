import React, { ReactNode } from "react";
import { visit } from "unist-util-visit";

export const extractText = (children: ReactNode): string => {
  if (children == null) return "";
  if (typeof children === "string" || typeof children === "number")
    return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (React.isValidElement<{ children?: ReactNode }>(children)) {
    return extractText(children.props.children);
  }
  return "";
};

export const parseChapterHeading = (
  title: string,
  locale: string,
): { number: number; text: string } | null => {
  const chapterKeyword = locale === "fr" ? "chapitre" : "chapter";
  const m = title.match(
    new RegExp(`^\\s*${chapterKeyword}\\s+(\\d+)\\s*[:\\-–—]?\\s*(.*)$`, "i"),
  );
  if (!m) return null;
  const number = parseInt(m[1], 10);
  const text = (m[2] ?? "").trim();
  return { number, text };
};

export const formatHeading = (children: ReactNode) => {
  return children === "Footnotes" ? <h2>Notes</h2> : <h2>{children}</h2>;
};

export function rehypeRemoveFootnoteBackrefs() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (!node.children) return;

      node.children = node.children.filter((child: any) => {
        if (child?.type !== "element") return true;
        if (child.tagName !== "a") return true;

        const p = child.properties ?? {};
        const isBackref =
          p["data-footnote-backref"] != null ||
          p.dataFootnoteBackref != null ||
          (typeof p.rel === "string" && p.rel.includes("footnote-backref")) ||
          (Array.isArray(p.rel) && p.rel.includes("footnote-backref"));

        return !isBackref;
      });
    });
  };
}
