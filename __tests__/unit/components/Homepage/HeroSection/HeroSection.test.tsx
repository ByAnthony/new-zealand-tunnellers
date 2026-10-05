import { fireEvent, render, screen } from "@testing-library/react";

import { HeroSection } from "@/components/HomePage/HeroSection/HeroSection";

describe("HeroSection Component", () => {
  test("matches snapshot", () => {
    const { asFragment } = render(<HeroSection />);

    expect(asFragment()).toMatchSnapshot();
  });

  test("renders the full-screen intro without an svg mask", () => {
    render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /The Kiwis who fought underground/,
    );
  });

  test("renders a link to the history section", () => {
    render(<HeroSection />);

    const historyLink = screen.getByRole("link", {
      name: /Explore their history/i,
    });

    expect(historyLink).toHaveAttribute("href", "#history");
  });

  test("renders a link to the tunnellers page", () => {
    render(<HeroSection />);

    const tunnellersPageLink = screen.getByRole("link", {
      name: /Discover the tunnellers/i,
    });

    expect(tunnellersPageLink).toHaveAttribute("href", "/tunnellers/");
  });

  describe("History hash cleanup", () => {
    let originalUrl: string;
    let originalState: unknown;

    beforeEach(() => {
      originalUrl = window.location.href;
      originalState = window.history.state;
      window.history.replaceState(
        { marker: "hero-test" },
        "",
        "/fr/?filter=1#history",
      );
    });

    afterEach(() => {
      jest.restoreAllMocks();
      window.history.replaceState(originalState, "", originalUrl);
    });

    test.each(["wheel", "touchmove"])(
      "removes the history hash on %s while preserving the URL and state",
      (eventName) => {
        render(<HeroSection />);
        const state = window.history.state;
        const replaceState = jest.spyOn(window.history, "replaceState");

        fireEvent(window, new Event(eventName));

        expect(replaceState).toHaveBeenCalledTimes(1);
        expect(replaceState).toHaveBeenCalledWith(state, "", "/fr/?filter=1");
        expect(window.location.pathname).toBe("/fr/");
        expect(window.location.search).toBe("?filter=1");
        expect(window.location.hash).toBe("");
        expect(window.history.state).toEqual(state);
      },
    );

    test.each([
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
    ])("removes the history hash on the %s scroll key", (key) => {
      render(<HeroSection />);

      fireEvent.keyDown(window, { key });

      expect(window.location.hash).toBe("");
    });

    test.each(["", "#other"])("leaves the %s hash unchanged", (hash) => {
      window.history.replaceState(null, "", `/fr/?filter=1${hash}`);
      render(<HeroSection />);
      const replaceState = jest.spyOn(window.history, "replaceState");

      fireEvent.wheel(window);
      fireEvent.touchMove(window);
      fireEvent.keyDown(window, { key: "ArrowDown" });

      expect(replaceState).not.toHaveBeenCalled();
      expect(window.location.hash).toBe(hash);
    });

    test("does not clear the hash during programmatic scrolling", () => {
      render(<HeroSection />);

      fireEvent.scroll(window);

      expect(window.location.hash).toBe("#history");
    });

    test("does not clear the hash when typing in an input", () => {
      render(
        <>
          <HeroSection />
          <input aria-label="Search" />
        </>,
      );

      fireEvent.keyDown(screen.getByRole("textbox"), { key: "ArrowDown" });

      expect(window.location.hash).toBe("#history");
    });

    test.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }])(
      "does not clear the hash for a modified scroll key (%j)",
      (modifier) => {
        render(<HeroSection />);

        fireEvent.keyDown(window, { key: "ArrowDown", ...modifier });

        expect(window.location.hash).toBe("#history");
      },
    );

    test("does not clear the hash for a prevented scroll key", () => {
      render(<HeroSection />);
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        cancelable: true,
      });
      event.preventDefault();

      fireEvent(window, event);

      expect(window.location.hash).toBe("#history");
    });

    test("does not clear the hash for an unrelated key", () => {
      render(<HeroSection />);

      fireEvent.keyDown(window, { key: "Tab" });

      expect(window.location.hash).toBe("#history");
    });

    test("removes the scroll input listeners on unmount", () => {
      const { unmount } = render(<HeroSection />);
      const replaceState = jest.spyOn(window.history, "replaceState");
      unmount();

      fireEvent.wheel(window);
      fireEvent.touchMove(window);
      fireEvent.keyDown(window, { key: "ArrowDown" });

      expect(replaceState).not.toHaveBeenCalled();
      expect(window.location.hash).toBe("#history");
    });
  });
});
