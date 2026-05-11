import { expect, test } from "@playwright/test";

test("redirects legacy English roll details id to the current slug URL", async ({
  request,
}) => {
  const response = await request.get("/roll/details.php?id=274", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(
    "/tunnellers/clifford-james-flewellyn--3_1655/",
  );
});

test("redirects legacy French roll details id to the current slug URL", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/details.php?id=274", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe(
    "/fr/tunnellers/clifford-james-flewellyn--3_1655/",
  );
});

test("falls back to the English roll for missing legacy details id", async ({
  request,
}) => {
  const response = await request.get("/roll/details.php", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/tunnellers/");
});

test("falls back to the French roll for invalid legacy details id", async ({
  request,
}) => {
  const response = await request.get("/fr/liste/details.php?id=invalid", {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/fr/tunnellers/");
});
