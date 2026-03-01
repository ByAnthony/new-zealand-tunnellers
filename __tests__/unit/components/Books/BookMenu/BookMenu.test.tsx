import { act, render, screen } from "@testing-library/react";
import React from "react";

import { BookMenu } from "@/components/Books/BookMenu/BookMenu";

describe("BookMenu", () => {
  const scrollListeners: Function[] = [];

  beforeEach(() => {
    scrollListeners.length = 0;
    jest
      .spyOn(window, "addEventListener")
      .mockImplementation((event, listener) => {
        if (event === "scroll") scrollListeners.push(listener as Function);
      });
    jest.spyOn(window, "removeEventListener").mockImplementation(() => {});
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders a link with French text and href for fr locale", () => {
    render(<BookMenu locale="fr" />);

    const link = screen.getByRole("link", { name: "Retour au sommaire" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/books/les-kiwis-aussi-creusent-des-tunnels",
    );
    expect(screen.getByText("Sommaire")).toBeInTheDocument();
  });

  test("renders a link with English text and href for en locale", () => {
    render(<BookMenu locale="en" />);

    const link = screen.getByRole("link", { name: "Back to contents" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/books/kiwis-dig-tunnels-too");
    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  test("is hidden on initial render", () => {
    render(<BookMenu locale="fr" />);

    const link = screen.getByRole("link", { name: "Retour au sommaire" });
    expect(link).toHaveClass("hidden");
  });

  test("becomes visible when scrolling down", () => {
    render(<BookMenu locale="fr" />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    const link = screen.getByRole("link", { name: "Retour au sommaire" });
    expect(link).not.toHaveClass("hidden");
  });

  test("becomes hidden again when scrolling back up", () => {
    render(<BookMenu locale="fr" />);

    // Scroll down first
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    // Then scroll back up
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    const link = screen.getByRole("link", { name: "Retour au sommaire" });
    expect(link).toHaveClass("hidden");
  });

  test("removes scroll listener on unmount", () => {
    const { unmount } = render(<BookMenu locale="fr" />);

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
  });
});
