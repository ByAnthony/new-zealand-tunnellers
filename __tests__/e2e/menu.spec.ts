import { test, expect } from "@playwright/test";

async function typeIntoSearch(
  search: import("@playwright/test").Locator,
  value: string,
) {
  await expect(search).toBeEditable();
  await search.click();
  await search.press("Control+A");
  await search.press("Backspace");
  if (value) {
    await search.pressSequentially(value, { delay: 50 });
  }
}

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

  const search = page.getByPlaceholder("Search for a Tunneller");
  await typeIntoSearch(search, "joseph");
  await expect(search).toHaveValue("joseph");
  await expect(page.getByTestId("dropdown")).toBeVisible();
  await Promise.all([
    page.waitForURL("/tunnellers/joseph-kelly--37713/", {
      waitUntil: "domcontentloaded",
    }),
    page.getByLabel("See Joseph Kelly profile").click(),
  ]);

  await expect(page).toHaveURL("/tunnellers/joseph-kelly--37713/");
});

test("can close the dropdown by clicking outside", async ({ page }) => {
  await page.goto("/");

  await page.locator("input").fill("james");
  const resultLink = page.getByLabel("See James Williamson profile").first();
  await expect(resultLink).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  await page.locator("body").click({ position: { x: 10, y: 300 } });

  await expect(page.getByTestId("dropdown")).not.toBeVisible();
});

test("can reopen the dropdown by clicking the search", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder("Search for a Tunneller");
  await search.fill("james");
  await expect(
    page.getByLabel("See James Williamson profile").first(),
  ).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  await page.mouse.click(1, 1);
  await expect(page.getByTestId("dropdown")).not.toBeVisible();

  await page.getByPlaceholder("Search for a Tunneller").click();
  await expect(page.getByTestId("dropdown")).toBeVisible();
});

test("can remove a name", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder("Search for a Tunneller");
  await typeIntoSearch(search, "david");
  await expect(search).toHaveValue("david");

  await typeIntoSearch(search, "");
  await expect(search).toHaveValue("");
  await expect(page.getByTestId("dropdown")).not.toBeVisible();
  await expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
});

test("can clear a name", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder("Search for a Tunneller");
  await typeIntoSearch(search, "david");
  await expect(search).toHaveValue("david");
  await expect(
    page.getByRole("button", { name: "Clear search input" }),
  ).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  const clearButton = page.getByRole("button", { name: "Clear search input" });
  await clearButton.click();

  await expect(page.getByTestId("dropdown")).not.toBeVisible();
  await expect(search).toHaveAttribute("placeholder", "Search for a Tunneller");
});

test("can switch from English to French", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Français" }).click();
  await page.waitForURL("/fr/", { waitUntil: "load" });

  await expect(page).toHaveURL("/fr/");
  await expect(page.getByRole("link", { name: "English" })).toBeVisible();
});

test("can switch from French to English", async ({ page }) => {
  await page.goto("/fr/");

  await page.getByRole("link", { name: "English" }).click();
  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Français" })).toBeVisible();
});

test("can go to the tunnellers page", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder("Search for a Tunneller");
  await search.fill("david");
  await expect(
    page.getByRole("link", { name: /See David .* profile/ }).first(),
  ).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  const link = page.getByRole("link", { name: "See all Tunnellers →" });
  await expect(link).toBeVisible();

  await link.click();
  await expect(page).toHaveURL("/tunnellers/");
  await expect(page.getByTestId("dropdown")).not.toBeVisible();
});
