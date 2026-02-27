import { act, render, screen } from "@testing-library/react";
import React from "react";

import { ReadingProgress } from "@/components/Books/ReadingProgress/ReadingProgress";

describe("ReadingProgress", () => {
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
      value: 100,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders nothing when no next button is found", () => {
    jest.spyOn(document, "querySelector").mockReturnValue(null);

    const { container } = render(<ReadingProgress />);

    expect(container).toBeEmptyDOMElement();
  });

  test("renders the progress bar when a next button is found", () => {
    const mockButton = {
      getBoundingClientRect: () => ({ top: 500 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockButton);

    render(<ReadingProgress />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  test("updates progress on scroll", () => {
    const mockButton = {
      getBoundingClientRect: () => ({ top: 500 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockButton);

    render(<ReadingProgress />);

    act(() => {
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 200,
      });
      scrollListeners.forEach((listener) => listener(new Event("scroll")));
    });

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  test("clamps progress to 100% when scrolled past the button", () => {
    const mockButton = {
      getBoundingClientRect: () => ({ top: -1000 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockButton);

    render(<ReadingProgress />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
