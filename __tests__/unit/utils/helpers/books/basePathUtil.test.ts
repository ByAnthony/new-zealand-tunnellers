import {
  basePath,
  bookFilePath,
  bookTitle,
} from "@/utils/helpers/books/basePathUtil";

describe("basePath", () => {
  test.each([
    { locale: "fr", expected: "/fr/books/kiwis-dig-tunnels-too" },
    { locale: "en", expected: "/books/kiwis-dig-tunnels-too" },
  ])(
    "returns the correct URL path for locale '$locale'",
    ({ locale, expected }) => {
      expect(basePath(locale)).toEqual(expected);
    },
  );
});

describe("bookFilePath", () => {
  test.each([
    { locale: "fr", expected: "books/les-kiwis-aussi-creusent-des-tunnels" },
    { locale: "en", expected: "books/kiwis-dig-tunnels-too" },
  ])(
    "returns the correct file path for locale '$locale'",
    ({ locale, expected }) => {
      expect(bookFilePath(locale)).toEqual(expected);
    },
  );
});

describe("bookTitle", () => {
  test.each([
    { locale: "fr", expected: "Les Kiwis aussi creusent des tunnels" },
    { locale: "en", expected: "Kiwis Dig Tunnels Too" },
  ])(
    "returns the correct title for locale '$locale'",
    ({ locale, expected }) => {
      expect(bookTitle(locale)).toEqual(expected);
    },
  );
});
