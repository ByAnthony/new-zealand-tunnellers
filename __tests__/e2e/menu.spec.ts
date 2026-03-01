import { test, expect } from "@playwright/test";

test("can click on logo to go to home page", async ({ page }) => {
  await page.goto("/tunnellers");

  const logo = page.getByLabel("Go to the Homepage");
  await logo.click();

  await expect(page).toHaveURL("/");
});

test("can search for a name", async ({ page }) => {
  await page.goto("/");

  const search = page.locator("input");
  expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");

  const input = "james williamson";
  expect(search.inputValue()).toBeNull;

  await search.fill(input);
  expect(
    await page
      .getByRole("textbox", { name: "Search for a Tunneller" })
      .inputValue(),
  ).toEqual(input);

  await expect(
    page.locator("a").filter({ hasText: "James Williamson (1877-1956)" }),
  ).toBeVisible();
  await expect(
    page.locator("a").filter({ hasText: "James Williamson (1876-†?)" }),
  ).toBeVisible();
});

test("can search and click on a name", async ({ page }) => {
  await page.goto("/");

  await page.locator("input").fill("joseph");
  const tunneller = page.getByLabel("See Joseph Kelly profile");
  await tunneller.hover();
  await tunneller.click();
  page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL("/tunnellers/442/");
});

test("can close the dropdown by clicking outside", async ({ page }) => {
  await page.goto("/");

  await page.locator("input").fill("james");
  await expect(page.locator("[class*='dropdown']")).toBeVisible();

  await page.mouse.click(1, 1);

  await expect(page.locator("[class*='dropdown']")).not.toBeVisible();
});

test("can reopen the dropdown by clicking the search", async ({ page }) => {
  await page.goto("/");

  const search = page.locator("input");
  await search.fill("james");
  await expect(page.locator("[class*='dropdown']")).toBeVisible();

  await page.mouse.click(1, 1);
  await expect(page.locator("[class*='dropdown']")).not.toBeVisible();

  await page.getByPlaceholder("Search for a Tunneller").click();
  await expect(page.locator("[class*='dropdown']")).toBeVisible();
});

test("can remove a name", async ({ page }) => {
  await page.goto("/");

  const search = page.locator("input");
  await search.fill("david");
  await expect(page.locator("[class*='dropdown']")).toBeVisible();

  await search.fill("");
  await expect(page.locator("[class*='dropdown']")).not.toBeVisible();
  await expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
});

test("can clear a name", async ({ page }) => {
  await page.goto("/");

  const search = page.locator("input");
  await search.fill("david");
  await expect(page.locator("[class*='dropdown']")).toBeVisible();

  const clearButton = page.getByRole("button", { name: "Clear search input" });
  await clearButton.click();

  await expect(page.locator("[class*='dropdown']")).not.toBeVisible();
  await expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
});

test("can go to the tunnellers page", async ({ page }) => {
  await page.goto("/");

  const search = page.locator("input");
  await search.fill("david");
  await expect(page.locator("[class*='dropdown']")).toBeVisible();

  const link = page.getByRole("link", { name: "See all Tunnellers →" });
  await expect(link).toBeVisible();

  await link.click();
  await expect(page).toHaveURL("/tunnellers/");
  await expect(page.locator("[class*='dropdown']")).not.toBeVisible();
});
