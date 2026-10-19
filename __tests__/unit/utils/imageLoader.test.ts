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

  test("uses the canonical site origin for production images", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
      configurable: true,
    });

    expect(imageLoader({ src: "/images/books/artwork.jpg", width: 325 })).toBe(
      "https://www.nztunnellers.com/images/books/artwork.jpg?w=325&q=75",
    );
  });
});
