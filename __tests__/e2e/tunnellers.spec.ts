import { test, expect } from "@playwright/test";

test("can change page and click on a name", async ({ page }) => {
  await page.goto("/tunnellers/?page=36");
  await expect(page).toHaveURL(/\/tunnellers\/\?page=36/);

  const tunneller = page.getByRole("link", {
    name: "Sapper Claude Percival Wells",
  });
  await tunneller.hover();
  await tunneller.click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(/tunnellers\/claude-percival-wells--21380/);
});

test("can filter and adjust pagination", async ({ page }) => {
  await page.goto("/tunnellers");

  await expect(page.getByText("936 results")).toBeVisible();

  await page.getByRole("button", { name: "38" }).click();

  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "1" })).toBeVisible();
  await expect(page.getByText("...")).toBeVisible();
  await expect(page.getByRole("button", { name: "38" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to next page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to next page" }),
  ).toBeDisabled();

  await page.getByLabel("7th Reinforcements").click();
  await expect(page.getByText("31 results")).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "1" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "2" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to next page" }),
  ).toBeVisible();
});

test("can reset filters and adjust pagination", async ({ page }) => {
  await page.goto("/tunnellers");

  await expect(page.getByText("936 results")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reset filters" }),
  ).toBeDisabled();

  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "1" })).toBeVisible();
  await expect(page.getByText("...")).toBeVisible();
  await expect(page.getByRole("button", { name: "38" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to next page" }),
  ).toBeVisible();

  await page.getByLabel("1st Reinforcements").click();
  await expect(page.getByText("103 results")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reset filters" }),
  ).toBeEnabled();

  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "1" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "3" })).toBeVisible();
  await expect(page.getByRole("button", { name: "4" })).toBeVisible();
  await expect(page.getByRole("button", { name: "5" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to next page" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.getByText("936 results")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reset filters" }),
  ).toBeDisabled();

  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to previous page" }),
  ).toBeDisabled();
  await expect(page.getByRole("button", { name: "1" })).toBeVisible();
  await expect(page.getByText("...")).toBeVisible();
  await expect(page.getByRole("button", { name: "38" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Go to next page" }),
  ).toBeVisible();
});

test("can navigate using pagination buttons", async ({ page }) => {
  await page.goto("/tunnellers");
  await page.getByRole("button", { name: "2" }).click();

  await expect(
    page.getByRole("link", { name: "Sapper Joseph Wilson Barker" }),
  ).toBeVisible();
});

test("filters appear in URL after filtering", async ({ page }) => {
  await page.goto("/tunnellers");

  await page.getByLabel("7th Reinforcements").click();
  await expect(page.getByText("31 results")).toBeVisible();

  await expect(page).toHaveURL(/detachment=/);
});

test("filters persist when switching language", async ({ page }) => {
  await page.goto("/tunnellers");

  await page.getByLabel("7th Reinforcements").click();
  await expect(page.getByText("31 results")).toBeVisible();

  await page.getByRole("link", { name: "Français" }).click();
  await page.waitForURL(/\/fr\/tunnellers\//, { waitUntil: "load" });

  await expect(page.getByText("31 résultats")).toBeVisible();
  await expect(page).toHaveURL(/detachment=/);
});

test("navigating directly to a filtered URL applies filters", async ({
  page,
}) => {
  await page.goto("/tunnellers");
  await page.getByLabel("7th Reinforcements").click();
  await expect(page.getByText("31 results")).toBeVisible();
  await expect(page).toHaveURL(/detachment=/);
  const filteredUrl = page.url();

  await page.goto("/tunnellers");
  await expect(page.getByText("936 results")).toBeVisible();

  await page.goto(filteredUrl);
  await expect(page.getByText("31 results")).toBeVisible();
});

test("back link from profile restores filters", async ({ page }) => {
  await page.goto("/tunnellers");

  await page.getByLabel("7th Reinforcements").click();
  await expect(page.getByText("31 results")).toBeVisible();
  await expect(page).toHaveURL(/detachment=/);

  await page
    .getByRole("link", { name: /Sapper.*7th Reinforcements/ })
    .first()
    .click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("link", { name: "Tunnellers" }).first().click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("31 results")).toBeVisible({ timeout: 10000 });
});

test("can navigate using previous and next buttons", async ({ page }) => {
  await page.goto("/tunnellers");
  await page.getByRole("button", { name: "Go to next page" }).click();

  await expect(
    page.getByRole("link", { name: "Sapper Joseph Wilson Barker" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Go to previous page" }).click();

  await expect(
    page.getByRole("link", { name: "Sapper Marcus Claude Abbott" }),
  ).toBeVisible();
});

test("filter button shows no badge by default on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/tunnellers");

  const filterButton = page.getByRole("button", { name: "Filters" });
  await expect(filterButton).toBeVisible();
  await expect(filterButton.locator("span")).not.toBeVisible();
});

test("filter button shows badge after selecting a filter on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/tunnellers");

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByLabel("1st Reinforcements").click();
  await page.getByRole("button", { name: "Done" }).click();

  const filterButton = page.getByRole("button", { name: /Filters/ });
  await expect(filterButton.locator("span")).toBeVisible();
  await expect(filterButton.locator("span")).toHaveText("1");
});

test("filter button badge count increases with multiple active filters on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/tunnellers");

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByLabel("1st Reinforcements").click();
  await page.getByLabel("Army Pay Corps").click();
  await page.getByRole("button", { name: "Done" }).click();

  const filterButton = page.getByRole("button", { name: /Filters/ });
  await expect(filterButton.locator("span")).toHaveText("2");
});

test("filter button badge disappears after reset on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/tunnellers");

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByLabel("1st Reinforcements").click();
  await page.getByRole("button", { name: "Done" }).click();

  await expect(
    page.getByRole("button", { name: /Filters/ }).locator("span"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page.getByRole("button", { name: "Done" }).click();

  await expect(
    page.getByRole("button", { name: "Filters" }).locator("span"),
  ).not.toBeVisible();
});

test("scroll position is saved and restored when navigating", async ({
  page,
}) => {
  await page.goto("/tunnellers");
  await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
  await page.getByRole("button", { name: "Go to page 3", exact: true }).click();
  await page.getByRole("link", { name: "Sapper Jeremiah Branigan" }).click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(/tunnellers\/jeremiah-branigan--4_1489/);
  await expect(page.getByText("Jeremiah", { exact: true })).toBeVisible();
  await expect(page.getByText("Branigan", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Tunnellers" }).first(),
  ).toBeVisible();

  await page.getByRole("link", { name: "Tunnellers" }).first().click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(/tunnellers/);
  await expect(
    page.getByRole("link", { name: "Sapper Jeremiah Branigan" }),
  ).toBeInViewport();
});
