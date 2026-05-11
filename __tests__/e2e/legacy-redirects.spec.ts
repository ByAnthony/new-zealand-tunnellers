import { test, expect } from "@playwright/test";

test("redirects legacy roll details with a non-numeric id to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/roll/details.php?id=abc", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/tunnellers/");
});

test("redirects legacy roll details without an id to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/roll/details.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/tunnellers/");
});

test("redirects the legacy roll index to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/roll/index.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/tunnellers/");
});

test("redirects French legacy roll details with a non-numeric id to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/details.php?id=abc", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/fr/tunnellers/");
});

test("redirects French legacy roll details without an id to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/details.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/fr/tunnellers/");
});

test("redirects the French legacy roll index to the tunnellers roll", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/index.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/fr/tunnellers/");
});
