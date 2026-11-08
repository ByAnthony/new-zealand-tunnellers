import { mockDatabase } from "@/test-utils/mocks/mockDatabase";
import {
  attacks,
  badLocs,
  edges,
  expectBound,
  locs,
  makeSqlRefs,
  refSql,
  type IdQuery,
} from "@/test-utils/sqlSecurity";
import type {
  ArticleData,
  ArticleReferenceData,
  ImageData,
  SectionData,
} from "@/types/article";
import type { Locale } from "@/types/locale";
import {
  allArticleIdsQuery,
  chapterQuery,
  imagesQuery,
  nextArticleQuery,
  sectionsQuery,
} from "@/utils/database/queries/historyChapterQuery";

const qs: ReadonlyArray<{
  name: string;
  run: IdQuery;
  where: RegExp;
  cols: (loc: Locale) => readonly string[];
}> = [
  {
    name: "chapterQuery",
    run: chapterQuery,
    where: /WHERE\s+article\.string_id\s*=\s*\?/,
    cols: (loc) => [
      `article.title_${loc} AS title`,
      `article.notes_${loc} AS notes`,
    ],
  },
  {
    name: "sectionsQuery",
    run: sectionsQuery,
    where: /WHERE\s+article_section_join\.article_id\s*=\s*\?/,
    cols: (loc) => [
      `article_section.title_${loc} AS title`,
      `article_section.text_${loc} AS text`,
    ],
  },
  {
    name: "imagesQuery",
    run: imagesQuery,
    where: /WHERE\s+article_image_join\.article_id\s*=\s*\?/,
    cols: (loc) => [
      "article_image.file AS file",
      ...(["title", "photographer", "reference", "alt"] as const).map(
        (col) => `article_image.${col}_${loc} AS ${col}`,
      ),
    ],
  },
];

describe.each(qs)("$name", ({ run, where, cols }) => {
  let refs: ReadonlyMap<Locale, string>;

  beforeAll(async () => {
    refs = await makeSqlRefs(run);
  });

  test.each(attacks)("binds $type SQLi text", async ({ val }) => {
    for (const loc of locs) {
      const { db, exec } = mockDatabase();
      await run(val, loc, db);
      expectBound(exec, val, refSql(refs, loc), where, cols(loc));
    }
  });

  test.each(edges)("binds $type edge-case ID", async ({ val }) => {
    for (const loc of locs) {
      const { db, exec } = mockDatabase();
      await run(val, loc, db);
      expectBound(exec, val, refSql(refs, loc), where, cols(loc));
    }
  });

  test.each(badLocs)("rejects $type before SQL execution", async ({ loc }) => {
    const { db, exec } = mockDatabase();
    await expect(run("one", loc as Locale, db)).rejects.toThrow(
      "Invalid locale",
    );
    expect(exec).not.toHaveBeenCalled();
  });

  test("propagates database failures", async () => {
    const { db, exec } = mockDatabase();
    const err = new Error("mock query failure");
    exec.mockRejectedValueOnce(err);

    await expect(run("chapter-id", "en", db)).rejects.toBe(err);
    expect(exec).toHaveBeenCalledTimes(1);
  });
});

describe("chapterQuery result edges", () => {
  test("returns only the first row", async () => {
    const a: ArticleData = {
      id: "one",
      chapter: 1,
      title: "First",
      notes: "",
    };
    const b: ArticleData = {
      id: "two",
      chapter: 2,
      title: "Second",
      notes: "Notes",
    };
    const { db } = mockDatabase([a, b]);

    await expect(chapterQuery("one", "en", db)).resolves.toBe(a);
  });

  test("returns undefined for no matches", async () => {
    const { db } = mockDatabase();
    await expect(chapterQuery("missing", "en", db)).resolves.toBeUndefined();
  });
});

describe("sectionsQuery result edges", () => {
  test("returns all rows unchanged, including empty text", async () => {
    const secs: SectionData[] = [
      { title: "Intro", text: "" },
      { title: "Next", text: "Text" },
    ];
    const { db } = mockDatabase(secs);

    await expect(sectionsQuery("one", "fr", db)).resolves.toBe(secs);
  });

  test("returns an empty array for no matches", async () => {
    const { db } = mockDatabase();
    await expect(sectionsQuery("missing", "en", db)).resolves.toEqual([]);
  });
});

describe("imagesQuery result edges", () => {
  test("returns all rows unchanged, including nullable metadata", async () => {
    const imgs: ImageData[] = [
      {
        file: "a.jpg",
        title: null,
        photographer: null,
        reference: null,
        alt: "",
      },
      {
        file: "b.jpg",
        title: "Tunnel",
        photographer: "A",
        reference: "R",
        alt: "B",
      },
    ];
    const { db } = mockDatabase(imgs);

    await expect(imagesQuery("one", "en", db)).resolves.toBe(imgs);
  });

  test("returns an empty array for no matches", async () => {
    const { db } = mockDatabase();
    await expect(imagesQuery("missing", "fr", db)).resolves.toEqual([]);
  });
});

// Cover both remaining exports when measuring the complete query module.
describe("other historyChapterQuery exports", () => {
  test.each(locs)(
    "nextArticleQuery selects only allowed %s columns",
    async (loc) => {
      const refs: ArticleReferenceData[] = [
        { id: "a", chapter: 1, title: "A" },
      ];
      const { db, exec } = mockDatabase(refs);

      await expect(nextArticleQuery(loc, db)).resolves.toBe(refs);
      expect(exec).toHaveBeenCalledTimes(1);
      expect(exec.mock.calls[0]).toHaveLength(1);
      expect(exec.mock.calls[0][0]).toContain(`article.title_${loc} AS title`);
    },
  );

  test.each(badLocs)(
    "nextArticleQuery rejects $type before SQL execution",
    async ({ loc }) => {
      const { db, exec } = mockDatabase();
      await expect(nextArticleQuery(loc as Locale, db)).rejects.toThrow(
        "Invalid locale",
      );
      expect(exec).not.toHaveBeenCalled();
    },
  );

  test("nextArticleQuery propagates database failures", async () => {
    const { db, exec } = mockDatabase();
    const err = new Error("mock query failure");
    exec.mockRejectedValueOnce(err);
    await expect(nextArticleQuery("en", db)).rejects.toBe(err);
  });

  test("allArticleIdsQuery preserves arbitrary ID strings", async () => {
    const ids = ["", "a'\"b", "École"];
    const { db, exec } = mockDatabase(ids.map((id) => ({ id })));

    await expect(allArticleIdsQuery(db)).resolves.toEqual(ids);
    expect(exec).toHaveBeenCalledWith(
      "SELECT article.string_id AS id FROM article",
    );
  });

  test("allArticleIdsQuery propagates database failures", async () => {
    const { db, exec } = mockDatabase();
    const err = new Error("mock query failure");
    exec.mockRejectedValueOnce(err);
    await expect(allArticleIdsQuery(db)).rejects.toBe(err);
  });

  test("allArticleIdsQuery returns an empty list", async () => {
    const { db } = mockDatabase();
    await expect(allArticleIdsQuery(db)).resolves.toEqual([]);
  });
});
