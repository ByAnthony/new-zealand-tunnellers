import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { mockTunnellersData } from "__tests__/unit/utils/mocks/mockTunnellers";

import { Menu } from "@/components/Menu/Menu";

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}));

const mockedUseRouter = require("next/navigation").useRouter;
const mockedUsePathname = require("next/navigation").usePathname;

mockedUseRouter.mockReturnValue({
  refresh: jest.fn(),
});

describe("Menu", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      refresh: jest.fn(),
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockTunnellersData,
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(<Menu />);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<Menu />);

    const nextButton = screen.getByRole("link", {
      name: "Go to the Homepage",
    });
    expect(nextButton).toHaveAttribute("href", "/");

    const search = screen.getByRole("textbox");
    expect(search).toBeInTheDocument();
    expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
  });

  test("can input a name", async () => {
    render(<Menu />);

    const search = screen.getByRole("textbox");
    fireEvent.click(search);
    fireEvent.change(search, {
      target: { value: "John Doe" },
    });

    expect(await screen.findByRole("list")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toHaveClass("surname");
    expect(screen.getByText("(1886-1952)")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[1]).toHaveAttribute(
      "href",
      "/tunnellers/test-tunneller--1_234",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tunnellers/search?query=John%20Doe&locale=en",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("becomes invisible on scrolling down", () => {
    render(<Menu />);
    expect(screen.getByTestId("menu")).toHaveClass("menu");

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu hidden");
  });

  test("becomes visible on scrolling up", () => {
    render(<Menu />);
    expect(screen.getByTestId("menu")).toHaveClass("menu");

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu hidden");

    fireEvent.scroll(window, { target: { scrollY: 75 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu");
  });

  describe("Keyboard", () => {
    test("closes dropdown with Escape key", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.change(search, { target: { value: "John Doe" } });
      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("re-opens dropdown with Enter key when results are available", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.change(search, { target: { value: "John Doe" } });
      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Enter" });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });
  });

  describe("Dropdown", () => {
    test("keeps previous results visible while the next search is loading", async () => {
      const secondSearch = Promise.withResolvers<typeof mockTunnellersData>();

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTunnellersData,
      });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => secondSearch.promise,
      });

      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.change(search, {
        target: { value: "John" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.change(search, {
        target: { value: "John D" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();

      secondSearch.resolve(mockTunnellersData);
      await screen.findByTestId("dropdown");
    });

    test("can close the dropdown with outside click", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("should not close the dropdown when click on the search bar", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("should not open dropdown if no input", () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("should reopen dropdown if input present", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();

      fireEvent.click(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("can click on tunnellers link", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      const tunnellersLink = screen.getByRole("link", {
        name: "See all Tunnellers →",
      });
      fireEvent.click(tunnellersLink);

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("can clear name and close the dropdown", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "" },
      });
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("no dropdown when name not found", () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe Smith" },
      });

      return waitFor(() => {
        expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
      });
    });
  });

  describe("Visual viewport", () => {
    test("sets dropdown max height from visualViewport on mount", () => {
      const mockViewport = {
        height: 600,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      Object.defineProperty(window, "visualViewport", {
        value: mockViewport,
        configurable: true,
        writable: true,
      });

      render(<Menu />);

      expect(mockViewport.addEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );

      Object.defineProperty(window, "visualViewport", {
        value: null,
        configurable: true,
        writable: true,
      });
    });
  });

  describe("Clear Button", () => {
    test("can clear the search input", async () => {
      render(<Menu />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(await screen.findByTestId("dropdown")).toBeInTheDocument();

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      expect(clearButton).toBeInTheDocument();

      fireEvent.click(clearButton);

      expect(
        screen.getByPlaceholderText("Search for a Tunneller"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("list")).toBeNull();
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("clear button replace magnifier icon", async () => {
      render(<Menu />);

      expect(
        screen.getByRole("img", {
          name: "Type a name to search for a Tunneller",
        }),
      ).toBeInTheDocument();

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      await screen.findByTestId("dropdown");

      expect(
        screen.queryByRole("img", {
          name: "Type a name to search for a Tunneller",
        }),
      ).not.toBeInTheDocument();

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      expect(clearButton).toBeInTheDocument();
    });

    test("clears the input field and focuses it", () => {
      render(<Menu />);

      const input = screen.getByPlaceholderText(
        "Search for a Tunneller",
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { value: "John" } });
      expect(input.value).toBe("John");

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      fireEvent.click(clearButton);

      expect(input.value).toBe("");
      expect(input).toHaveFocus();
    });
  });

  describe("Language switcher", () => {
    const mockedUseLocale = require("next-intl").useLocale;

    test("renders Français link on English locale", () => {
      mockedUseLocale.mockReturnValue("en");
      mockedUsePathname.mockReturnValue("/tunnellers");
      render(<Menu />);

      const link = screen.getByRole("link", { name: "Français" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/fr/tunnellers");
    });

    test("renders English link on French locale", () => {
      mockedUseLocale.mockReturnValue("fr");
      mockedUsePathname.mockReturnValue("/fr/tunnellers");
      render(<Menu />);

      const link = screen.getByRole("link", { name: "English" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/tunnellers");
    });

    test("French switcher falls back to / when path is only /fr", () => {
      mockedUseLocale.mockReturnValue("fr");
      mockedUsePathname.mockReturnValue("/fr");
      render(<Menu />);

      const link = screen.getByRole("link", { name: "English" });
      expect(link).toHaveAttribute("href", "/");
    });
  });
});
