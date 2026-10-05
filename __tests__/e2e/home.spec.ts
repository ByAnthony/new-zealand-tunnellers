import { test, expect } from "@playwright/test";

test("homepage loads with the correct heading", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("The Kiwis who fought underground"),
  ).toBeVisible();
});

test("can navigate to the tunnellers roll from the homepage", async ({
  page,
}) => {
  await page.goto("/");

  const link = page.getByRole("link", { name: /Discover the tunnellers/i });

  await expect(link).toBeVisible();
  await link.click();

  await page.waitForURL("/tunnellers/", { waitUntil: "load" });
  await expect(page).toHaveURL("/tunnellers/");
});

test("can scroll to the history section on the homepage", async ({ page }) => {
  await page.goto("/");

  const link = page.getByRole("link", { name: /Explore their history/i });

  await expect(link).toBeVisible();
  await link.click();

  await page.waitForURL("#history", { waitUntil: "load" });
  await expect(page).toHaveURL("#history");
});

test("history section is visible on the homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("History of the Company")).toBeVisible();
});

test("can navigate to the book", async ({ page }) => {
  await page.goto("/");

  const bookLink = page.getByRole("link", {
    name: "Kiwis Dig Tunnels Too",
    exact: true,
  });

  await expect(bookLink).toBeVisible();
  await expect(bookLink).toHaveAttribute("href", "/kiwis-dig-tunnels-too/");
});

test("French homepage loads with the correct heading", async ({ page }) => {
  await page.goto("/fr/");

  await expect(
    page.getByText("Les Kiwis qui ont combattu sous terre"),
  ).toBeVisible();
});

test("can navigate to the french version of the book", async ({ page }) => {
  await page.goto("/fr/");

  const bookLink = page.getByRole("link", {
    name: "Les Kiwis aussi creusent des tunnels",
    exact: true,
  });

  await expect(bookLink).toBeVisible();
  await expect(bookLink).toHaveAttribute("href", "/fr/kiwis-dig-tunnels-too/");
});
