import { pageUrl } from "@/utils/helpers/metadata";

describe("pageUrl", () => {
  test("keeps the English homepage URL canonical", () => {
    expect(pageUrl("en", "/")).toBe("https://www.nztunnellers.com/");
  });

  test("removes trailing slashes from English URLs", () => {
    expect(pageUrl("en", "/tunnellers/harry-corrin--4_1415/")).toBe(
      "https://www.nztunnellers.com/tunnellers/harry-corrin--4_1415",
    );
  });

  test("removes trailing slashes from French URLs", () => {
    expect(pageUrl("fr", "/history/beneath-artois-fields/")).toBe(
      "https://www.nztunnellers.com/fr/history/beneath-artois-fields",
    );
  });

  test("returns the French homepage without a trailing slash", () => {
    expect(pageUrl("fr", "/")).toBe("https://www.nztunnellers.com/fr");
  });
});
