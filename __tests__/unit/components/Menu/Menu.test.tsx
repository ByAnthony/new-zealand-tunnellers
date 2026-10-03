import { act, fireEvent, render, screen } from "@testing-library/react";

import { Menu } from "@/components/Menu/Menu";
import { mockTunnellersData } from "@/test-utils/mocks/mockTunnellers";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/"),
}));

const mockedUseRouter = require("next/navigation").useRouter;
const mockedUsePathname = require("next/navigation").usePathname;

mockedUseRouter.mockReturnValue({
  push: mockPush,
  refresh: jest.fn(),
});

describe("Menu", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedUsePathname.mockReturnValue("/");
    mockedUseRouter.mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
    window.scrollTo = jest.fn();
    Object.defineProperty(window, "scrollY", {
      value: 0,
      configurable: true,
      writable: true,
    });
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    document.body.style.overflowY = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.querySelectorAll("#history").forEach((element) => {
      element.remove();
    });
  });

  test("matches the snapshot", () => {
    const { asFragment } = render(<Menu tunnellers={mockTunnellersData} />);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the component correctly", () => {
    render(<Menu tunnellers={mockTunnellersData} />);

    const nextButton = screen.getByRole("link", {
      name: "Go to the Homepage",
    });
    expect(nextButton).toHaveAttribute("href", "/");

    const search = screen.getByRole("textbox", {
      name: "Search for a tunneller",
    });
    expect(search).toBeInTheDocument();
    expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
  });

  test("can input a name", () => {
    render(<Menu tunnellers={mockTunnellersData} />);

    const search = screen.getByRole("textbox");
    fireEvent.click(search);
    fireEvent.change(search, {
      target: { value: "John Doe" },
    });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toHaveClass("surname");
    expect(screen.getByText("(1886-1952)")).toBeInTheDocument();
    expect(screen.getAllByRole("link")[1]).toHaveAttribute(
      "href",
      "/tunnellers/test-tunneller--1_234/",
    );
  });

  test("becomes invisible on scrolling down", () => {
    render(<Menu tunnellers={mockTunnellersData} />);
    expect(screen.getByTestId("menu")).toHaveClass("menu");

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu hidden");
  });

  test("becomes visible on scrolling up", () => {
    render(<Menu tunnellers={mockTunnellersData} />);
    expect(screen.getByTestId("menu")).toHaveClass("menu");

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu hidden");

    fireEvent.scroll(window, { target: { scrollY: 75 } });
    expect(screen.getByTestId("menu")).toHaveClass("menu");
  });

  test("stays visible when a scroll event fires at the top", () => {
    render(<Menu tunnellers={mockTunnellersData} />);

    fireEvent.scroll(window, { target: { scrollY: 0 } });

    expect(screen.getByTestId("menu")).not.toHaveClass("hidden");
  });

  test("resets visibility and scroll tracking when navigating to a map", () => {
    const { rerender } = render(<Menu tunnellers={mockTunnellersData} />);

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).toHaveClass("hidden");
    (window.scrollTo as jest.Mock).mockClear();

    mockedUsePathname.mockReturnValue("/history/tunnellers-works");
    rerender(<Menu tunnellers={mockTunnellersData} />);

    expect(screen.getByTestId("menu")).not.toHaveClass("hidden");
    expect(window.scrollTo).not.toHaveBeenCalled();

    fireEvent.scroll(window, { target: { scrollY: 100 } });
    expect(screen.getByTestId("menu")).not.toHaveClass("hidden");
  });

  describe("Keyboard", () => {
    test("closes dropdown with Escape key", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.change(search, { target: { value: "John Doe" } });
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("re-opens dropdown with Enter key when results are available", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.change(search, { target: { value: "John Doe" } });

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Enter" });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });
  });

  describe("Dropdown", () => {
    test("can close the dropdown with outside click", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("should not close the dropdown when click on the search bar", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("should not open dropdown if no input", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("should reopen dropdown if input present", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();

      fireEvent.click(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("should reopen dropdown when search regains focus", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.mouseDown(document.body);
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();

      fireEvent.focus(search);
      expect(screen.getByTestId("dropdown")).toBeInTheDocument();
    });

    test("can click on tunnellers link", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      const tunnellersLink = screen.getByRole("link", {
        name: "See all Tunnellers →",
      });
      fireEvent.click(tunnellersLink);

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("can clear name and close the dropdown", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "" },
      });
      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
    });

    test("no dropdown when name not found", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe Smith" },
      });

      expect(screen.queryByTestId("dropdown")).not.toBeInTheDocument();
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

      render(<Menu tunnellers={mockTunnellersData} />);

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
    test("can clear the search input", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(screen.getByTestId("dropdown")).toBeInTheDocument();

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

    test("clear button replace magnifier icon", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

      expect(
        screen.getByRole("img", {
          name: "Search for a tunneller",
        }),
      ).toBeInTheDocument();

      const search = screen.getByRole("textbox");
      fireEvent.click(search);
      fireEvent.change(search, {
        target: { value: "John Doe" },
      });

      expect(
        screen.queryByRole("img", {
          name: "Search for a tunneller",
        }),
      ).not.toBeInTheDocument();

      const clearButton = screen.getByRole("button", {
        name: "Clear search input",
      });
      expect(clearButton).toBeInTheDocument();
    });

    test("clears the input field and focuses it", () => {
      render(<Menu tunnellers={mockTunnellersData} />);

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
    const openNavigationDialog = () => {
      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    };

    test("renders Français link on English locale", () => {
      mockedUseLocale.mockReturnValue("en");
      mockedUsePathname.mockReturnValue("/tunnellers");
      render(<Menu tunnellers={mockTunnellersData} />);
      openNavigationDialog();

      const link = screen.getByRole("link", { name: "Français" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/fr/tunnellers/");
    });

    test("renders English link on French locale", () => {
      mockedUseLocale.mockReturnValue("fr");
      mockedUsePathname.mockReturnValue("/fr/tunnellers");
      render(<Menu tunnellers={mockTunnellersData} />);
      openNavigationDialog();

      const link = screen.getByRole("link", { name: "English" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/tunnellers/");
    });

    test("French switcher falls back to / when path is only /fr", () => {
      mockedUseLocale.mockReturnValue("fr");
      mockedUsePathname.mockReturnValue("/fr");
      render(<Menu tunnellers={mockTunnellersData} />);
      openNavigationDialog();

      const link = screen.getByRole("link", { name: "English" });
      expect(link).toHaveAttribute("href", "/");
    });

    test("drops stale map params when switching locale from the roll list", () => {
      mockedUseLocale.mockReturnValue("en");
      mockedUsePathname.mockReturnValue("/tunnellers");
      window.history.replaceState(
        null,
        "",
        "/tunnellers?view=map&zoom=8&detachment=main-body",
      );

      render(<Menu tunnellers={mockTunnellersData} />);
      openNavigationDialog();

      fireEvent.click(screen.getByRole("link", { name: "Français" }));

      expect(mockPush).toHaveBeenCalledWith(
        "/fr/tunnellers/?detachment=main-body",
      );
    });

    test("preserves map params when switching locale from the origin map", () => {
      mockedUseLocale.mockReturnValue("en");
      mockedUsePathname.mockReturnValue("/tunnellers");
      window.history.replaceState(
        null,
        "",
        "/tunnellers?view=map&zoom=8&detachment=main-body",
      );

      render(
        <>
          <div data-testid="roll-origin-map" />
          <Menu tunnellers={mockTunnellersData} />
        </>,
      );
      openNavigationDialog();

      fireEvent.click(screen.getByRole("link", { name: "Français" }));

      expect(mockPush).toHaveBeenCalledWith(
        "/fr/tunnellers/?view=map&zoom=8&detachment=main-body",
      );
    });
  });

  describe("Navigation dialog", () => {
    test("stays open on link click and closes only once the route changes", () => {
      mockedUsePathname.mockReturnValue("/");
      const { container, rerender } = render(
        <Menu tunnellers={mockTunnellersData} />,
      );
      const dialog = container.querySelector("dialog") as HTMLDialogElement;

      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(dialog.open).toBe(true);
      expect(document.body.style.overflowY).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.top).toBe(`${-window.scrollY}px`);
      expect(document.body.style.width).toBe("100%");

      fireEvent.click(screen.getByRole("link", { name: "Tunnellers" }));
      // Should still be open right after the click, so the old page never
      // shows through mid-transition.
      expect(dialog.open).toBe(true);
      expect(document.body.style.overflowY).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.width).toBe("100%");

      mockedUsePathname.mockReturnValue("/tunnellers");
      rerender(<Menu tunnellers={mockTunnellersData} />);
      expect(dialog.open).toBe(false);
      expect(document.body.style.overflowY).toBe("visible");
      expect(document.body.style.position).toBe("");
      expect(document.body.style.top).toBe("");
      expect(document.body.style.width).toBe("");
    });

    test("locks page scrolling while open and restores it when closed", () => {
      jest.useFakeTimers();
      const { container } = render(<Menu tunnellers={mockTunnellersData} />);
      const dialog = container.querySelector("dialog") as HTMLDialogElement;
      const menuToggle = screen.getByRole("button", { name: "Open menu" });

      fireEvent.click(menuToggle);
      expect(dialog.open).toBe(true);
      expect(document.body.style.overflowY).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.top).toBe(`${-window.scrollY}px`);
      expect(document.body.style.width).toBe("100%");

      fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
      expect(dialog.open).toBe(false);
      expect(menuToggle).toHaveAttribute("data-menu-closed", "true");
      expect(document.body.style.overflowY).toBe("visible");
      expect(document.body.style.position).toBe("");
      expect(document.body.style.top).toBe("");
      expect(document.body.style.width).toBe("");

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(menuToggle).not.toHaveAttribute("data-menu-closed");
    });

    test("stays open briefly on history anchor link click before closing", () => {
      jest.useFakeTimers();
      const historyTarget = document.createElement("section");
      historyTarget.id = "history";
      historyTarget.scrollIntoView = jest.fn();
      document.body.appendChild(historyTarget);

      const { container } = render(<Menu tunnellers={mockTunnellersData} />);
      const dialog = container.querySelector("dialog") as HTMLDialogElement;
      const menuToggle = screen.getByRole("button", { name: "Open menu" });

      fireEvent.click(menuToggle);
      expect(dialog.open).toBe(true);
      (window.scrollTo as jest.Mock).mockClear();

      fireEvent.click(screen.getByRole("link", { name: "History" }));
      expect(dialog.open).toBe(true);
      expect(document.body.style.overflowY).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.width).toBe("100%");

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(dialog.open).toBe(false);
      expect(menuToggle).toHaveAttribute("data-menu-closed", "true");
      expect(document.body.style.overflowY).toBe("visible");
      expect(document.body.style.position).toBe("");
      expect(document.body.style.width).toBe("");
      expect(window.scrollTo).not.toHaveBeenCalled();
      expect(historyTarget.scrollIntoView).toHaveBeenCalledTimes(1);
    });

    test("scrolls the history anchor after navigating to the homepage", () => {
      const requestAnimationFrameSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((callback) => {
          callback(0);
          return 0;
        });
      const historyTarget = document.createElement("section");
      historyTarget.id = "history";
      historyTarget.scrollIntoView = jest.fn();
      document.body.appendChild(historyTarget);
      mockedUsePathname.mockReturnValue("/tunnellers");
      window.history.replaceState(null, "", "/tunnellers/");

      const { container, rerender } = render(
        <Menu tunnellers={mockTunnellersData} />,
      );
      const dialog = container.querySelector("dialog") as HTMLDialogElement;

      fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
      expect(dialog.open).toBe(true);
      (window.scrollTo as jest.Mock).mockClear();

      fireEvent.click(screen.getByRole("link", { name: "History" }));
      expect(dialog.open).toBe(true);

      window.history.replaceState(null, "", "/#history");
      mockedUsePathname.mockReturnValue("/");
      rerender(<Menu tunnellers={mockTunnellersData} />);

      expect(dialog.open).toBe(false);
      expect(document.body.style.overflowY).toBe("visible");
      expect(window.scrollTo).not.toHaveBeenCalled();
      expect(historyTarget.scrollIntoView).toHaveBeenCalledTimes(1);

      requestAnimationFrameSpy.mockRestore();
    });

    test("stays open briefly on origin map link click before closing", () => {
      jest.useFakeTimers();
      mockedUsePathname.mockReturnValue("/tunnellers");
      const { container } = render(<Menu tunnellers={mockTunnellersData} />);
      const dialog = container.querySelector("dialog") as HTMLDialogElement;
      const menuToggle = screen.getByRole("button", { name: "Open menu" });

      fireEvent.click(menuToggle);
      expect(dialog.open).toBe(true);

      fireEvent.click(screen.getByRole("link", { name: /Map Origins/ }));
      expect(dialog.open).toBe(true);
      expect(document.body.style.overflowY).toBe("hidden");
      expect(document.body.style.position).toBe("fixed");
      expect(document.body.style.width).toBe("100%");

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(dialog.open).toBe(false);
      expect(menuToggle).toHaveAttribute("data-menu-closed", "true");
      expect(document.body.style.overflowY).toBe("visible");
      expect(document.body.style.position).toBe("");
      expect(document.body.style.width).toBe("");
    });
  });
});
