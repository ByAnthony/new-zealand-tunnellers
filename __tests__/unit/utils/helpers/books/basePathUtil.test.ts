import { basePath, bookTitle } from "@/utils/helpers/books/basePathUtil";

describe("basePath", () => {
  test.each([
    { locale: "fr", expected: "/books/les-kiwis-aussi-creusent-des-tunnels" },
    { locale: "en", expected: "/books/kiwis-dig-tunnels-too" },
  ])(
    "returns the correct path for locale '$locale'",
    ({ locale, expected }) => {
      expect(basePath(locale)).toEqual(expected);
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
