import {
  getChapterProgress,
  saveChapterProgress,
} from "@/utils/helpers/books/chapterProgressUtil";

describe("chapterProgressUtil", () => {
  const STORAGE_KEY = "book-reading-progress";

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("saves and gets chapter progress using normalized pathname", () => {
    saveChapterProgress("/books/kiwis-dig-tunnels-too/prologue/", 15.2);

    expect(getChapterProgress("books/kiwis-dig-tunnels-too/prologue")).toBe(15);
    expect(getChapterProgress("/books/kiwis-dig-tunnels-too/prologue/")).toBe(
      15,
    );
  });

  test("does overwrite existing progress when new progress is 0", () => {
    saveChapterProgress("/books/kiwis-dig-tunnels-too/prologue/", 15.2);
    saveChapterProgress("/books/kiwis-dig-tunnels-too/prologue/", 0);

    expect(getChapterProgress("/books/kiwis-dig-tunnels-too/prologue/")).toBe(
      0,
    );
  });

  test("returns 0 when chapter is not found", () => {
    expect(getChapterProgress("/books/kiwis-dig-tunnels-too/chapter-1/")).toBe(
      0,
    );
  });

  test("returns 0 when localStorage contains invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{invalid-json");
    expect(getChapterProgress("/books/kiwis-dig-tunnels-too/prologue/")).toBe(
      0,
    );
  });

  test("does not throw when localStorage.setItem throws in saveChapterProgress", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      saveChapterProgress("/books/kiwis-dig-tunnels-too/prologue/", 50),
    ).not.toThrow();
  });
});
