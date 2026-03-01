import { render, screen } from "@testing-library/react";
import React from "react";

import { ChapterProgressRing } from "@/components/Books/ChapterProgressRing/ChapterProgressRing";

const mockGetChapterProgress = jest.fn();

jest.mock("@/utils/helpers/books/chapterProgressUtil", () => ({
  CHAPTER_PROGRESS_EVENT: "chapter-progress-update",
  getChapterProgress: (...args: unknown[]) => mockGetChapterProgress(...args),
}));

describe("ChapterProgressRing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows arrow when progress is 0", () => {
    mockGetChapterProgress.mockReturnValue(0);

    render(<ChapterProgressRing pathname="/books/my-book/chapter-1" />);

    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  test("shows arrow when progress is partial", () => {
    mockGetChapterProgress.mockReturnValue(50);

    render(<ChapterProgressRing pathname="/books/my-book/chapter-1" />);

    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  test("shows tick when progress is 100", () => {
    mockGetChapterProgress.mockReturnValue(100);

    render(<ChapterProgressRing pathname="/books/my-book/chapter-1" />);

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.queryByText("→")).not.toBeInTheDocument();
  });

  test("calls getChapterProgress with the given pathname", () => {
    mockGetChapterProgress.mockReturnValue(0);

    render(<ChapterProgressRing pathname="/books/my-book/chapter-2" />);

    expect(mockGetChapterProgress).toHaveBeenCalledWith(
      "/books/my-book/chapter-2",
    );
  });

  test("renders the CSS ring element", () => {
    mockGetChapterProgress.mockReturnValue(0);

    const { container } = render(
      <ChapterProgressRing pathname="/books/my-book/chapter-1" />,
    );

    expect(container.querySelector(".ring")).toBeInTheDocument();
    expect(container.querySelector(".inner")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
