import imageLoader from "@/utils/imageLoader";

describe("imageLoader", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  describe.each(["production", "development"])("%s", (environment) => {
    beforeEach(() => {
      Object.defineProperty(process.env, "NODE_ENV", {
        value: environment,
        writable: true,
        configurable: true,
      });
    });

    test.each(["/images/books/artwork.jpg", "images/books/artwork.jpg"])(
      "returns a root-relative URL for %s",
      (src) => {
        expect(imageLoader({ src, width: 325 })).toBe(
          "/images/books/artwork.jpg?w=325&q=75",
        );
      },
    );

    test.each(["https://nztunnellers.com", "https://www.nztunnellers.com"])(
      "keeps images on the page origin %s",
      (origin) => {
        const imageUrl = new URL(
          imageLoader({ src: "/images/books/artwork.jpg", width: 650 }),
          `${origin}/kiwis-dig-tunnels-too/chapter-1/`,
        );

        expect(imageUrl.origin).toBe(origin);
        expect(imageUrl.pathname).toBe("/images/books/artwork.jpg");
        expect(imageUrl.search).toBe("?w=650&q=75");
      },
    );
  });
});
