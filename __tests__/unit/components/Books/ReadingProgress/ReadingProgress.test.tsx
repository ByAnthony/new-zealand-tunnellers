import { act, render, screen } from "@testing-library/react";
import React from "react";

import { ReadingProgress } from "@/components/Books/ReadingProgress/ReadingProgress";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/books/my-book/chapter-1"),
}));

const mockGetChapterProgress = jest.fn();

jest.mock("@/utils/helpers/books/chapterProgressUtil", () => ({
  CHAPTER_PROGRESS_EVENT: "chapter-progress-update",
  getChapterProgress: (...args: unknown[]) => mockGetChapterProgress(...args),
  saveChapterProgress: jest.fn(),
}));

describe("ReadingProgress", () => {
  const scrollListeners: Function[] = [];

  beforeEach(() => {
    scrollListeners.length = 0;
    mockGetChapterProgress.mockReturnValue(0);
    jest
      .spyOn(window, "addEventListener")
      .mockImplementation((event, listener) => {
        if (event === "scroll") scrollListeners.push(listener as Function);
      });
    jest.spyOn(window, "removeEventListener").mockImplementation(() => {});
    jest.spyOn(window, "scrollTo").mockImplementation(() => {});
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

  test("restores scroll position from saved progress on mount", () => {
    mockGetChapterProgress.mockReturnValue(50);
    const mockButton = {
      getBoundingClientRect: () => ({ top: 500 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockButton);

    render(<ReadingProgress />);

    // buttonDocTop = 500 + 0 = 500, totalScrollable = 500 - 100 = 400
    // targetScrollY = (50 / 100) * 400 = 200
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 200,
      behavior: "instant",
    });
  });

  test("does not restore scroll when no progress is saved", () => {
    mockGetChapterProgress.mockReturnValue(0);
    const mockButton = {
      getBoundingClientRect: () => ({ top: 500 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockButton);

    render(<ReadingProgress />);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test("dispatches chapter progress event on unmount to update cached contents page", () => {
    const mockButton = {
      getBoundingClientRect: () => ({ top: 500 }),
    } as unknown as Element;
    jest.spyOn(document, "querySelector").mockReturnValue(mockButton);
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    const { unmount } = render(<ReadingProgress />);

    // Clear events dispatched during mount/scroll
    dispatchSpy.mockClear();

    unmount();

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "chapter-progress-update" }),
    );
  });
});
