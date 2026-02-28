import { act, render, screen } from "@testing-library/react";
import React from "react";

import { BookMenu } from "@/components/Books/BookMenu/BookMenu";

import STYLES from "@/components/Books/BookMenu/BookMenu.module.scss";

type EventListener = (event: Event) => void;

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
  const scrollListeners: Array<(event: Event) => void> = [];

  const triggerScroll = () => {
    scrollListeners.forEach((listener) => listener(new Event("scroll")));
  };

  beforeEach(() => {
    scrollListeners.length = 0;
    jest
      .spyOn(window, "addEventListener")
      .mockImplementation(
        (event: string, listener: EventListener | EventListenerObject) => {
          if (event === "scroll") {
            scrollListeners.push(listener as EventListener);
          }
        },
      );
    jest
      .spyOn(window, "removeEventListener")
      .mockImplementation(
        (event: string, listener: EventListener | EventListenerObject) => {
          if (event === "scroll") {
            const index = scrollListeners.indexOf(listener as EventListener);
            if (index >= 0) {
              scrollListeners.splice(index, 1);
            }
          }
        },
      );
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
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
    expect(screen.getByText("→")).toBeInTheDocument();
  });

  test("renders the sommaire link in French", () => {
    render(<BookMenu locale="fr" />);

    expect(screen.getByText("Sommaire")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/books/les-kiwis-aussi-creusent-des-tunnels",
    );
  });

  test("applies the hidden class on initial render", () => {
    render(<BookMenu locale="en" />);

    const menuLink = screen.getByRole("link");

    expect(menuLink.classList).toContain(STYLES.hidden);
  });

  test("removes the hidden class when scrolling down", () => {
    render(<BookMenu locale="en" />);

    const menuLink = screen.getByRole("link");

    act(() => {
      window.scrollY = 200;
      triggerScroll();
    });

    expect(menuLink.classList).not.toContain(STYLES.hidden);
  });

  test("re-applies the hidden class when scrolling back up", () => {
    render(<BookMenu locale="en" />);

    const menuLink = screen.getByRole("link");

    act(() => {
      window.scrollY = 200;
      triggerScroll();
    });
    expect(menuLink.classList).not.toContain(STYLES.hidden);

    act(() => {
      window.scrollY = 50;
      triggerScroll();
    });

    expect(menuLink.classList).toContain(STYLES.hidden);
  });
});
