import { render, screen } from "@testing-library/react";

import ContentsContainer from "@/components/Books/Contents/ContentsContainer";
import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";
import { offlineBookSavedKey } from "@/utils/helpers/books/offlineBookSavedKey";

const mockGetCookie = jest.fn();

jest.mock("next/headers", () => ({
  cookies: () => Promise.resolve({ get: (key: string) => mockGetCookie(key) }),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children, components }: any) => {
    const lines = (children as string).split("\n").filter(Boolean);
    return (
      <div>
        {lines.map((line: string) => {
          if (line.startsWith("# ") && components?.h1)
            return (
              <div key={line}>{components.h1({ children: line.slice(2) })}</div>
            );
          if (line.startsWith("- ") && components?.li)
            return (
              <div key={line}>{components.li({ children: line.slice(2) })}</div>
            );
          return <span key={line}>{line}</span>;
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
    mockGetCookie.mockReturnValue(undefined);
  });

  test("renders contents for French locale using contents file", async () => {
    mockedReadBookMarkdown.mockResolvedValue(
      "# Les Kiwis aussi creusent des tunnels\n\n- Prologue\n",
    );

    const component = await ContentsContainer({ locale: "fr" });
    render(component);

    expect(mockedReadBookMarkdown).toHaveBeenCalledWith("fr", "contents");
    expect(mockGetCookie).toHaveBeenCalledWith(offlineBookSavedKey("fr"));
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
    expect(mockGetCookie).toHaveBeenCalledWith(offlineBookSavedKey("en"));
  });

  test("reads saved offline state from a locale-specific cookie", async () => {
    mockGetCookie.mockReturnValue({ value: "true" });
    mockedReadBookMarkdown.mockResolvedValue("# Kiwis Dig Tunnels Too\n");

    await ContentsContainer({ locale: "en" });

    expect(mockGetCookie).toHaveBeenCalledWith(offlineBookSavedKey("en"));
  });
});
