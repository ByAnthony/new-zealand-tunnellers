import { render, screen } from "@testing-library/react";

import { Contents } from "@/components/Books/Contents/Contents";

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
          const linkMatch = line.match(/^- \[(.+?)\]\((.+?)\)$/);
          if (linkMatch && components?.a)
            return (
              <div key={i}>
                {components.a({ href: linkMatch[2], children: linkMatch[1] })}
              </div>
            );
          return <span key={i}>{line}</span>;
        })}
        {components?.ul && components.ul({ children: <li>Contents entry</li> })}
      </div>
    );
  },
}));

jest.mock("remark-gfm", () => () => {});
jest.mock("remark-remove-comments", () => () => {});
jest.mock("unist-util-visit", () => ({ visit: jest.fn() }));

const frContent = `# Les Kiwis aussi creusent des tunnels

## Sommaire

- [Prologue](./prologue.md)
- [Chapitre 1 : Les tunneliers des antipodes](./chapter-1-the-tunnellers-from-the-antipodes.md)
- [Chapitre 2 : En faire de bons soldats](./chapter-2-forging-good-soldiers.md)
- [Sources](./sources.md)
`;

const enContent = `# Kiwis Dig Tunnels Too

## Contents

- [Prologue](./prologue.md)
- [Chapter 1: The tunnellers](./chapter-1-the-tunnellers.md)
- [Sources](./sources.md)
`;

describe("Contents", () => {
  test("matches the snapshot (fr)", () => {
    const { asFragment } = render(<Contents locale="fr" content={frContent} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the book title", () => {
    render(<Contents locale="fr" content={frContent} />);
    expect(
      screen.getByRole("heading", {
        name: "Les Kiwis aussi creusent des tunnels",
      }),
    ).toBeInTheDocument();
  });

  test("places the offline reading toggle beside the contents heading", () => {
    render(<Contents locale="en" content={enContent} />);
    const heading = screen.getByRole("heading", { name: "Contents" });
    const toggle = screen.getByRole("checkbox", { name: "Offline reading" });

    expect(heading.parentElement).toHaveClass("contents-heading");
    expect(heading.parentElement).toContainElement(toggle);
  });

  test("renders the artwork beside the contents list", () => {
    render(<Contents locale="en" content={enContent} />);
    const artwork = screen.getByAltText("");
    expect(artwork).toHaveAttribute("width", "325");
    expect(artwork.closest(".contents-layout")).toContainElement(
      screen.getByRole("list"),
    );
  });

  test("renders chapter links with chapter number for fr", () => {
    render(<Contents locale="fr" content={frContent} />);
    expect(screen.getByText("1")).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByText("Les tunneliers des antipodes"),
    ).toBeInTheDocument();
  });

  test("renders chapter links with chapter number for en", () => {
    render(<Contents locale="en" content={enContent} />);
    expect(screen.getByText("1")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("The tunnellers")).toBeInTheDocument();
  });

  test("renders non-chapter entries without a chapter number", () => {
    render(<Contents locale="fr" content={frContent} />);
    expect(screen.getByText("Prologue")).toBeInTheDocument();
    expect(screen.queryByText("Chapitre 0")).not.toBeInTheDocument();
  });

  test("links point to the correct locale path using href slug", () => {
    render(<Contents locale="fr" content={frContent} />);
    const prologueLink = screen.getByRole("link", { name: /Prologue/i });
    expect(prologueLink).toHaveAttribute(
      "href",
      "/fr/kiwis-dig-tunnels-too/prologue/",
    );
  });

  test("fr chapter links use English slug from href", () => {
    render(<Contents locale="fr" content={frContent} />);
    const chapterLink = screen.getByRole("link", {
      name: /Les tunneliers des antipodes/i,
    });
    expect(chapterLink).toHaveAttribute(
      "href",
      "/fr/kiwis-dig-tunnels-too/chapter-1-the-tunnellers-from-the-antipodes/",
    );
  });
});
