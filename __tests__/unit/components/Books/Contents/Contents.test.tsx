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
jest.mock("unist-util-visit", () => ({ visit: jest.fn() }));

const frContent = `# Les Kiwis aussi creusent des tunnels

- Prologue
- Chapitre 1 : Les tunneliers des antipodes
- Chapitre 2 : En faire de bons soldats
- Sources
`;

const enContent = `# Kiwis Dig Tunnels Too

- Prologue
- Chapter 1: The tunnellers
- Sources
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

  test("renders chapter links with chapter number for fr", () => {
    render(<Contents locale="fr" content={frContent} />);
    expect(screen.getByText("Chapitre 1")).toBeInTheDocument();
    expect(
      screen.getByText("Les tunneliers des antipodes"),
    ).toBeInTheDocument();
  });

  test("renders chapter links with chapter number for en", () => {
    render(<Contents locale="en" content={enContent} />);
    expect(screen.getByText("Chapter 1")).toBeInTheDocument();
    expect(screen.getByText("The tunnellers")).toBeInTheDocument();
  });

  test("renders non-chapter entries without a chapter number", () => {
    render(<Contents locale="fr" content={frContent} />);
    expect(screen.getByText("Prologue")).toBeInTheDocument();
    expect(screen.queryByText("Chapitre 0")).not.toBeInTheDocument();
  });

  test("links point to the correct locale path", () => {
    render(<Contents locale="fr" content={frContent} />);
    const prologueLink = screen.getByRole("link", { name: /Prologue/i });
    expect(prologueLink).toHaveAttribute(
      "href",
      "/books/les-kiwis-aussi-creusent-des-tunnels/prologue",
    );
  });
});
