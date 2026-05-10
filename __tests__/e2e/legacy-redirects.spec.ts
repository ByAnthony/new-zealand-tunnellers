import { test, expect } from "@playwright/test";

test("redirects legacy roll details with an id to the numeric tunneller route", async ({
  request,
}) => {
  const response = await request.get("/roll/details.php?id=123", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/tunnellers/123/");
});

test("redirects legacy roll details without an id to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/roll/details.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/tunnellers/");
});

test("redirects the legacy roll index to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/roll/index.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/tunnellers/");
});

test("redirects French legacy roll details with an id to the numeric tunneller route", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/details.php?id=123", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/fr/tunnellers/123/");
});

test("redirects French legacy roll details without an id to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/details.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/fr/tunnellers/");
});

test("redirects the French legacy roll index to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/index.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toContain("/fr/tunnellers/");
});
