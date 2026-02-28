import {
  getChapterProgress,
  saveChapterProgress,
} from "@/utils/helpers/books/chapterProgressUtil";

describe("chapterProgressUtil", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("saveChapterProgress", () => {
    test("saves progress for a pathname", () => {
      saveChapterProgress("/books/my-book/chapter-1", 75);

      const stored = JSON.parse(
        localStorage.getItem("book-reading-progress") ?? "{}",
      );
      expect(stored["/books/my-book/chapter-1"]).toBe(75);
    });

    test("rounds progress before saving", () => {
      saveChapterProgress("/books/my-book/chapter-1", 33.6);

      const stored = JSON.parse(
        localStorage.getItem("book-reading-progress") ?? "{}",
      );
      expect(stored["/books/my-book/chapter-1"]).toBe(34);
    });

    test("preserves existing entries when saving new progress", () => {
      saveChapterProgress("/books/my-book/chapter-1", 50);
      saveChapterProgress("/books/my-book/chapter-2", 80);

      const stored = JSON.parse(
        localStorage.getItem("book-reading-progress") ?? "{}",
      );
      expect(stored["/books/my-book/chapter-1"]).toBe(50);
      expect(stored["/books/my-book/chapter-2"]).toBe(80);
    });

    test("does not throw when localStorage is unavailable", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });

      expect(() =>
        saveChapterProgress("/books/my-book/chapter-1", 50),
      ).not.toThrow();
    });
  });

  describe("getChapterProgress", () => {
    test("returns 0 when no data is stored", () => {
      expect(getChapterProgress("/books/my-book/chapter-1")).toBe(0);
    });

    test("returns 0 for an unknown pathname", () => {
      saveChapterProgress("/books/my-book/chapter-1", 60);

      expect(getChapterProgress("/books/my-book/chapter-2")).toBe(0);
    });

    test("returns the saved progress for a pathname", () => {
      saveChapterProgress("/books/my-book/chapter-1", 42);

      expect(getChapterProgress("/books/my-book/chapter-1")).toBe(42);
    });

    test("does not throw when localStorage is unavailable", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage unavailable");
      });

      expect(() =>
        getChapterProgress("/books/my-book/chapter-1"),
      ).not.toThrow();
      expect(getChapterProgress("/books/my-book/chapter-1")).toBe(0);
    });
  });
});
