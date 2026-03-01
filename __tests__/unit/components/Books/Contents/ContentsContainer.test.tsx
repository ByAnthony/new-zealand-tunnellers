import { render, screen } from "@testing-library/react";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

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

jest.mock("@/utils/helpers/books/markdownUtil", () => ({
  readBookMarkdown: jest.fn(),
}));

const mockedReadBookMarkdown = readBookMarkdown as jest.Mock;

describe("ContentsContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders contents for French locale using sommaire file", async () => {
    mockedReadBookMarkdown.mockResolvedValue(
      "# Les Kiwis aussi creusent des tunnels\n\n- Prologue\n",
    );

    const component = await ContentsContainer({ locale: "fr" });
    render(component);

    expect(mockedReadBookMarkdown).toHaveBeenCalledWith("fr", "sommaire");
    expect(
      screen.getByRole("heading", {
        name: "Les Kiwis aussi creusent des tunnels",
      }),
    ).toBeInTheDocument();
  });

  test("renders contents for English locale using contents file", async () => {
    mockedReadBookMarkdown.mockResolvedValue(
      "# Kiwis Dig Tunnels Too\n\n- Prologue\n",
    );

    const component = await ContentsContainer({ locale: "en" });
    render(component);

    expect(mockedReadBookMarkdown).toHaveBeenCalledWith("en", "contents");
  });
});
