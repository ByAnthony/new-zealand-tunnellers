import fs from "fs/promises";

import { readBookMarkdown } from "@/utils/helpers/books/markdownUtil";

jest.mock("fs/promises");

describe("readBookMarkdown", () => {
  const mockedReadFile = fs.readFile as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns file content for a French chapter", async () => {
    mockedReadFile.mockResolvedValue("# Chapitre 1");

    const result = await readBookMarkdown("fr", "chapitre-1-introduction");

    expect(result).toEqual("# Chapitre 1");
    expect(mockedReadFile).toHaveBeenCalledWith(
      expect.stringContaining(
        "les-kiwis-aussi-creusent-des-tunnels/chapitre-1-introduction.md",
      ),
      "utf-8",
    );
  });

  test("returns file content for an English chapter", async () => {
    mockedReadFile.mockResolvedValue("# Chapter 1");

    const result = await readBookMarkdown("en", "chapter-1-introduction");

    expect(result).toEqual("# Chapter 1");
    expect(mockedReadFile).toHaveBeenCalledWith(
      expect.stringContaining(
        "kiwis-dig-tunnels-too/chapter-1-introduction.md",
      ),
      "utf-8",
    );
  });

  test("throws a readable error when the file is not found", async () => {
    mockedReadFile.mockRejectedValue(new Error("ENOENT: no such file"));

    await expect(readBookMarkdown("fr", "missing-chapter")).rejects.toThrow(
      "Failed to read markdown file: ENOENT: no such file",
    );
  });

  test("throws a readable error for non-Error rejections", async () => {
    mockedReadFile.mockRejectedValue("unexpected failure");

    await expect(readBookMarkdown("fr", "bad-chapter")).rejects.toThrow(
      "Failed to read markdown file: unexpected failure",
    );
  });
});
