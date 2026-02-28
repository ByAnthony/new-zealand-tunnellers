import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { BookMenu } from "@/components/Books/BookMenu/BookMenu";

jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

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
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
    jest.spyOn(document, "querySelector").mockReturnValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders the contents link in English", () => {
    render(<BookMenu locale="en" />);

    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/books/kiwis-dig-tunnels-too",
    );
  });

  test("renders the sommaire link in French", () => {
    render(<BookMenu locale="fr" />);

    expect(screen.getByText("Sommaire")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/books/les-kiwis-aussi-creusent-des-tunnels",
    );
  });

  test("is hidden on initial render", () => {
    const { container } = render(<BookMenu locale="en" />);

    expect(container.querySelector(".menu")).not.toHaveClass("visible");
  });

  test("becomes visible when scrolling down past 150px", () => {
    const { container } = render(<BookMenu locale="en" />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    expect(container.querySelector(".menu")).toHaveClass("visible");
  });

  test("does not become visible when scrolling down below 150px threshold", () => {
    const { container } = render(<BookMenu locale="en" />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    expect(container.querySelector(".menu")).not.toHaveClass("visible");
  });

  test("hides when scrolling up", () => {
    const { container } = render(<BookMenu locale="en" />);

    // Scroll down to show
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });
    expect(container.querySelector(".menu")).toHaveClass("visible");

    // Scroll up to hide
    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    expect(container.querySelector(".menu")).not.toHaveClass("visible");
  });

  test("adjusts bottom offset when footer enters the viewport", () => {
    const mockFooter = {
      getBoundingClientRect: () => ({ top: 700 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockFooter);

    const { container } = render(<BookMenu locale="en" />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    // innerHeight=800, footer.top=700 → overlap = 800 - 700 = 100
    expect(container.querySelector(".menu")).toHaveStyle("bottom: 100px");
  });

  test("bottom offset is 0 when footer is not yet visible", () => {
    const mockFooter = {
      getBoundingClientRect: () => ({ top: 1200 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockFooter);

    const { container } = render(<BookMenu locale="en" />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    // footer.top=1200 > innerHeight=800 → no overlap
    expect(container.querySelector(".menu")).toHaveStyle("bottom: 0px");
  });

  test("dispatches chapter progress event when link is clicked", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    render(<BookMenu locale="en" />);

    fireEvent.click(screen.getByRole("link"));

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "chapter-progress-update" }),
    );
  });
});
