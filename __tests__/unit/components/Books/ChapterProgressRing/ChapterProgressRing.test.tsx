import { act, render, screen } from "@testing-library/react";
import React from "react";

import { ChapterProgressRing } from "@/components/Books/ChapterProgressRing/ChapterProgressRing";

const mockGetChapterProgress = jest.fn();
let animationFrameCallbacks: Array<(timestamp: number) => void> = [];

jest.mock("@/utils/helpers/books/chapterProgressUtil", () => ({
  CHAPTER_PROGRESS_EVENT: "chapter-progress-update",
  getChapterProgress: (...args: unknown[]) => mockGetChapterProgress(...args),
}));

const flushAnimationFrames = () =>
  act(() => {
    const callbacks = animationFrameCallbacks;
    animationFrameCallbacks = [];
    callbacks.forEach((callback) => callback(0));
  });

const renderChapterProgressRing = (pathname: string) => {
  const result = render(<ChapterProgressRing pathname={pathname} />);
  flushAnimationFrames();
  return result;
};

describe("ChapterProgressRing", () => {
  beforeEach(() => {
    animationFrameCallbacks = [];
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        animationFrameCallbacks.push(callback);
        return animationFrameCallbacks.length;
      });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("shows arrow when progress is 0", () => {
    mockGetChapterProgress.mockReturnValue(0);

    renderChapterProgressRing("/books/my-book/chapter-1");

    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  test("shows arrow when progress is partial", () => {
    mockGetChapterProgress.mockReturnValue(50);

    renderChapterProgressRing("/books/my-book/chapter-1");

    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  test("shows tick when progress is 100", () => {
    mockGetChapterProgress.mockReturnValue(100);

    renderChapterProgressRing("/books/my-book/chapter-1");

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.queryByText("→")).not.toBeInTheDocument();
  });

  test("calls getChapterProgress with the given pathname", () => {
    mockGetChapterProgress.mockReturnValue(0);

    renderChapterProgressRing("/books/my-book/chapter-2");

    expect(mockGetChapterProgress).toHaveBeenCalledWith(
      "/books/my-book/chapter-2",
    );
  });

  test("refreshes progress when the contents page is restored from browser history", () => {
    mockGetChapterProgress.mockReturnValueOnce(0).mockReturnValueOnce(100);

    renderChapterProgressRing("/books/my-book/chapter-1");

    expect(screen.getByText("→")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.queryByText("→")).not.toBeInTheDocument();
  });

  test("renders the CSS ring element", () => {
    mockGetChapterProgress.mockReturnValue(0);

    const { container } = renderChapterProgressRing("/books/my-book/chapter-1");

    expect(container.querySelector(".ring")).toBeInTheDocument();
    expect(container.querySelector(".inner")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
