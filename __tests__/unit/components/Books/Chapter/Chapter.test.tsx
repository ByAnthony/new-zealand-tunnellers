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

const sourcesContent = `# Sources

Some sources here.
`;

describe("Chapter", () => {
  beforeEach(() => {
    mockedUsePathname.mockReturnValue(
      "/books/les-kiwis-aussi-creusent-des-tunnels/chapitre-1-les-tunneliers-des-antipodes",
    );
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(
      <Chapter locale="fr" content={chapterContent} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the chapter title and number", () => {
    render(<Chapter locale="fr" content={chapterContent} />);

    expect(
      screen.getByRole("heading", {
        name: "Les tunneliers des antipodes",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Chapitre 1")).toBeInTheDocument();
  });

  test("renders the breadcrumb link back to the book contents", () => {
    render(<Chapter locale="fr" content={chapterContent} />);

    const bookLink = screen.getByRole("link", {
      name: "Les Kiwis aussi creusent des tunnels",
    });
    expect(bookLink).toHaveAttribute(
      "href",
      "/books/les-kiwis-aussi-creusent-des-tunnels",
    );
  });

  test("renames 'Footnotes' heading to 'Notes'", () => {
    render(<Chapter locale="fr" content={chapterContent} />);

    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Footnotes" }),
    ).not.toBeInTheDocument();
  });

  test("shows HowToCite on a regular chapter page", () => {
    mockedUsePathname.mockReturnValue(
      "/books/les-kiwis-aussi-creusent-des-tunnels/chapitre-1-les-tunneliers-des-antipodes",
    );
    render(<Chapter locale="fr" content={chapterContent} />);

    expect(
      screen.getByRole("heading", { name: /How to cite this page/i }),
    ).toBeInTheDocument();
  });

  test.each([
    "/books/les-kiwis-aussi-creusent-des-tunnels/sources",
    "/books/les-kiwis-aussi-creusent-des-tunnels/bibliographie",
    "/books/les-kiwis-aussi-creusent-des-tunnels/remerciements",
  ])("hides HowToCite on '%s'", (pathname) => {
    mockedUsePathname.mockReturnValue(pathname);
    render(<Chapter locale="fr" content={sourcesContent} />);

    expect(
      screen.queryByRole("heading", { name: /How to cite this page/i }),
    ).not.toBeInTheDocument();
  });
});
