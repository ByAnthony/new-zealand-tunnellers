import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import React from "react";

import { Chapter } from "@/components/Books/Chapter/Chapter";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children, components }: any) => {
    const lines = (children as string).split("\n").filter(Boolean);
    return (
      <div>
        {lines.map((line: string, i: number) => {
          if (line.startsWith("# ") && components?.h1)
            return (
              <div key={i}>{components.h1({ children: line.slice(2) })}</div>
            );
          if (line.startsWith("## ") && components?.h2)
            return (
              <div key={i}>{components.h2({ children: line.slice(3) })}</div>
            );
          const linkMatch = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (linkMatch && components?.a)
            return (
              <div key={i}>
                {components.a({ href: linkMatch[2], children: linkMatch[1] })}
              </div>
            );
          const footnoteItemMatch = line.match(/^\[\^(\d+)\]: (.+)$/);
          if (footnoteItemMatch && components?.li)
            return (
              <div key={i}>
                {components.li({
                  node: {
                    properties: {
                      id: `user-content-fn-${footnoteItemMatch[1]}`,
                    },
                  },
                  children: <p>{footnoteItemMatch[2]}</p>,
                })}
              </div>
            );
          if (line.startsWith("- ") && components?.li)
            return (
              <div key={i}>{components.li({ children: line.slice(2) })}</div>
            );
          return <span key={i}>{line}</span>;
        })}
      </div>
    );
  },
}));

jest.mock("remark-gfm", () => () => {});
jest.mock("remark-remove-comments", () => () => {});
jest.mock("rehype-raw", () => () => {});
jest.mock("unist-util-visit", () => ({ visit: jest.fn() }));

jest.mock("react-zoom-pan-pinch", () => ({
  TransformWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TransformComponent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useControls: () => ({ zoomIn: jest.fn(), resetTransform: jest.fn() }),
}));

const mockedUsePathname = usePathname as jest.Mock;

jest.useFakeTimers().setSystemTime(new Date("2025-01-01"));

const chapterContent = `# Chapitre 1 : Les tunneliers des antipodes

Paragraph of text.

A link to [an external site](https://example.com).

## Notes

[^1]: A footnote.
`;

const enChapterContent = `# Chapter 1 : The Tunnellers

Paragraph of text.
`;

const chapterWithFootnotesContent = `# Chapitre 1 : Les tunneliers des antipodes

[external site](https://example.com)
[footnote ref](#user-content-fn-1)
- plain list item
[^1]: A footnote.
`;

const sourcesContent = `# Sources

Some sources here.
`;

const frSlug = "chapitre-1-les-tunneliers-des-antipodes";
const enSlug = "chapter-1-the-tunnellers";

describe("Chapter", () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue(`/fr/kiwis-dig-tunnels-too/${frSlug}/`);
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <Chapter locale="fr" slug={frSlug} content={chapterContent} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the chapter title and number", () => {
    render(<Chapter locale="fr" slug={frSlug} content={chapterContent} />);

    expect(
      screen.getByRole("heading", {
        name: "Les tunneliers des antipodes",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
  });

  test("renders the breadcrumb link back to the book contents", () => {
    render(<Chapter locale="fr" slug={frSlug} content={chapterContent} />);

    const bookLink = screen.getByRole("link", {
      name: "Go to the table of contents",
    });
    expect(bookLink).toHaveAttribute("href", "/fr/kiwis-dig-tunnels-too/");
  });

  test.each([
    ["en", "Chapter 2: Forging Good Soldiers"],
    ["fr", "Chapitre 2 : En faire de bons soldats"],
  ])("renders the vignette above chapter 2 in %s", (locale, title) => {
    render(
      <Chapter
        locale={locale}
        slug="chapter-2-forging-good-soldiers"
        content={`# ${title}`}
      />,
    );

    const vignette = screen.getByAltText("");
    expect(vignette).toHaveAttribute("src", "/images/books/vignette-2.png");
    expect(vignette.nextElementSibling).toBe(
      screen.getByRole("heading", { level: 1 }),
    );
  });

  test("renders the matching vignette on other chapters", () => {
    render(<Chapter locale="en" slug={enSlug} content={enChapterContent} />);
    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      "/images/books/vignette-1.png",
    );
  });

  test.each(["sources", "printed-sources", "bibliography", "acknowledgments"])(
    "does not render a vignette on '%s'",
    (slug) => {
      render(<Chapter locale="en" slug={slug} content={sourcesContent} />);

      expect(screen.queryByAltText("")).not.toBeInTheDocument();
    },
  );

  test.each(["prologue", "epilogue"])(
    "renders the %s vignette from its slug",
    (slug) => {
      render(<Chapter locale="en" slug={slug} content={`# ${slug}`} />);

      expect(screen.getByAltText("")).toHaveAttribute(
        "src",
        `/images/books/vignette-${slug}.png`,
      );
    },
  );

  test("renames 'Footnotes' heading to 'Notes'", () => {
    render(<Chapter locale="fr" slug={frSlug} content={chapterContent} />);

    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Footnotes" }),
    ).not.toBeInTheDocument();
  });

  test("shows HowToCite on a regular chapter page", () => {
    render(<Chapter locale="fr" slug={frSlug} content={chapterContent} />);

    expect(
      screen.getByRole("heading", { name: /Comment citer cette page/i }),
    ).toBeInTheDocument();
  });

  test("cites the public English URL even when the runtime path includes /en/", () => {
    mockedUsePathname.mockReturnValue(`/en/kiwis-dig-tunnels-too/${enSlug}/`);
    render(<Chapter locale="en" slug={enSlug} content={enChapterContent} />);

    const citationUrl = screen.getByText(/Available at:/).textContent;
    expect(citationUrl).toBe(
      `Available at: www.nztunnellers.com/kiwis-dig-tunnels-too/${enSlug}/`,
    );
  });

  test.each(["sources", "bibliography", "acknowledgments"])(
    "hides HowToCite on '%s'",
    (slug) => {
      render(<Chapter locale="fr" slug={slug} content={sourcesContent} />);

      expect(
        screen.queryByRole("heading", { name: /Comment citer cette page/i }),
      ).not.toBeInTheDocument();
    },
  );

  test("renders English locale breadcrumb with correct aria-labels", () => {
    render(<Chapter locale="en" slug={enSlug} content={enChapterContent} />);

    expect(
      screen.getByRole("link", { name: "Go to the table of contents" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
  });

  test("renders an external link as a plain anchor", () => {
    render(
      <Chapter
        locale="fr"
        slug={frSlug}
        content={chapterWithFootnotesContent}
      />,
    );

    const externalLink = screen.getByRole("link", { name: "external site" });
    expect(externalLink).toHaveAttribute("href", "https://example.com");
    expect(externalLink).not.toHaveClass("footnote");
  });

  test("renders a footnote ref link with bracket notation", () => {
    render(
      <Chapter
        locale="fr"
        slug={frSlug}
        content={chapterWithFootnotesContent}
      />,
    );

    expect(screen.getByText("[footnote ref]")).toBeInTheDocument();
  });

  test("renders a plain list item without footnote node as a regular li", () => {
    render(
      <Chapter
        locale="fr"
        slug={frSlug}
        content={chapterWithFootnotesContent}
      />,
    );

    expect(screen.getByText("plain list item")).toBeInTheDocument();
  });

  test("renders a footnote item with its number anchor and inline content", () => {
    render(
      <Chapter
        locale="fr"
        slug={frSlug}
        content={chapterWithFootnotesContent}
      />,
    );

    const footnoteAnchor = screen.getByRole("link", { name: "1." });
    expect(footnoteAnchor).toHaveAttribute("href", "#user-content-fnref-1");
    expect(screen.getByText("A footnote.")).toBeInTheDocument();
  });
});
