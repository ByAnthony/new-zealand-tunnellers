import { test, expect } from "@playwright/test";

test("can navigate to next chapters", async ({ page }) => {
  await page.goto("/");

  const heading = await page.getByRole("heading", { name: "Chapter" });

  const chapter2Link = await page.getByLabel("Go to Chapter 2: Journey To");
  await chapter2Link.hover();
  await chapter2Link.click();

  await page.waitForURL("/history/journey-to-war/", { waitUntil: "load" });
  await expect(page).toHaveURL("/history/journey-to-war/");
  await expect(
    page.getByRole("heading", { name: "Journey To War", exact: true }),
  ).toBeVisible();
  await expect(heading).toBeVisible();

  const chapter3Link = await page.getByLabel("Go to Chapter 3: Beneath");
  await chapter3Link.hover();
  await chapter3Link.click();

  await page.waitForURL("/history/beneath-artois-fields/", {
    waitUntil: "load",
  });
  await expect(page).toHaveURL("/history/beneath-artois-fields/");
  await expect(
    page.getByRole("heading", { name: "Beneath Artois Fields", exact: true }),
  ).toBeVisible();
  await expect(heading).toBeVisible();
});

test("can navigate between a history chapter and its related map period", async ({
  page,
}) => {
  await page.goto("/history/beneath-artois-fields/");

  await expect(
    page.getByRole("heading", { name: "Beneath Artois Fields", exact: true }),
  ).toBeVisible();

  await page.getByRole("link", { name: /Underground Warfare/i }).click();

  await page.waitForURL(
    /\/maps\/tunnellers-works\/?\?period=true&frontlines=true&from=1916-03-16&to=1916-11-15/,
    { waitUntil: "load" },
  );
  await expect(page).toHaveURL(
    /\/maps\/tunnellers-works\/?\?period=true&frontlines=true&from=1916-03-16&to=1916-11-15/,
  );

  await page.getByRole("link", { name: "About this period" }).click();

  await page.waitForURL("/history/beneath-artois-fields/", {
    waitUntil: "load",
  });
  await expect(page).toHaveURL("/history/beneath-artois-fields/");
  await expect(
    page.getByRole("heading", { name: "Beneath Artois Fields", exact: true }),
  ).toBeVisible();
});
