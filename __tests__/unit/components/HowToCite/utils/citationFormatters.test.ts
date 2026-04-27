import {
  buildCitationTitle,
  buildCitationUrl,
  formatBookSubpath,
} from "@/components/HowToCite/utils/citationFormatters";

describe("citationFormatters", () => {
  test("formats an English chapter path into a citation title", () => {
    expect(
      buildCitationTitle({
        pathname: "/book/chapter-4-tunnelling-under-arras",
        locale: "en",
      }),
    ).toBe("“Chapter 4: Tunnelling under arras”, in Kiwis Dig Tunnels Too");
  });

  test("formats a French chapter path into a citation title", () => {
    expect(
      buildCitationTitle({
        pathname: "/fr/livre/chapitre-4-tunnelling-under-arras",
        locale: "fr",
      }),
    ).toBe(
      "« Chapitre 4 : Tunnelling under arras », in Les Kiwis aussi creusent des tunnels",
    );
  });

  test("builds a timeline citation title for a tunneller", () => {
    expect(
      buildCitationTitle({
        summary: {
          name: {
            forename: "John",
            surname: "Doe",
          },
          birth: "1886",
          death: "1952",
        },
        timeline: true,
        locale: "en",
      }),
    ).toBe("“World War I Timeline of John Doe”");
  });

  test("builds a history article URL from a title", () => {
    expect(
      buildCitationUrl({
        title: "Beneath Artois Fields",
        locale: "en",
      }),
    ).toBe("www.nztunnellers.com/history/beneath-artois-fields");
  });

  test("builds a timeline URL for a French tunneller page", () => {
    expect(
      buildCitationUrl({
        tunnellerSlug: "john-doe",
        timeline: true,
        locale: "fr",
      }),
    ).toBe("www.nztunnellers.com/fr/tunnellers/john-doe/wwi-timeline");
  });

  test("formats a chapter path fragment", () => {
    expect(
      formatBookSubpath("/book/chapter-12-bridging-at-the-end", "en"),
    ).toBe("Chapter 12: Bridging at the end");
  });
});
