import { test, expect } from "@playwright/test";

test("homepage loads with the correct heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "The New Zealand Tunnellers" }),
  ).toBeVisible();
});

test("can navigate to the tunnellers roll from the homepage", async ({
  page,
}) => {
  await page.goto("/");

  const link = page.getByRole("link", {
    name: /Discover.*The New Zealand Tunnellers/s,
  });

  await expect(link).toBeVisible();
  await link.click();

  await page.waitForURL("/tunnellers/", { waitUntil: "load" });
  await expect(page).toHaveURL("/tunnellers/");
});

test("history section is visible on the homepage", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "History of the Company" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Chapter", exact: false }),
  ).toBeVisible();
});

test("resources section is visible on the homepage", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Resources to Explore" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Kiwis Dig Tunnels Too" }),
  ).toBeVisible();
});

test("can navigate to the book from the resources section", async ({
  page,
}) => {
  await page.goto("/");

  const bookLink = page.getByRole("link", { name: /Kiwis Dig Tunnels Too/i });

  await expect(bookLink).toBeVisible();
  await expect(bookLink).toHaveAttribute(
    "href",
    "/books/kiwis-dig-tunnels-too",
  );
});

test("French homepage loads with the correct heading", async ({ page }) => {
  await page.goto("/fr/");

  await expect(
    page.getByRole("heading", { name: "Les Tunneliers néo-zélandais" }),
  ).toBeVisible();
});

test("French resources section is visible on the homepage", async ({
  page,
}) => {
  await page.goto("/fr/");

  await expect(
    page.getByRole("heading", { name: "Ressources à explorer" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Les Kiwis aussi creusent des tunnels" }),
  ).toBeVisible();
});

test("can navigate to the book from the French resources section", async ({
  page,
}) => {
  await page.goto("/fr/");

  const bookLink = page.getByRole("link", {
    name: /Les Kiwis aussi creusent des tunnels/i,
  });

  await expect(bookLink).toBeVisible();
  await expect(bookLink).toHaveAttribute(
    "href",
    "/fr/books/kiwis-dig-tunnels-too",
  );
});
