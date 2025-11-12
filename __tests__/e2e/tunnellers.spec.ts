import { test, expect } from "@playwright/test";

test("can change page and click on a name", async ({ page }) => {
  await page.goto("/tunnellers");

  await page.getByRole("button", { name: "38" }).click();
  await page.getByRole("button", { name: "37" }).click();
  await page.getByRole("button", { name: "36" }).click();

  const tunneller = page.getByRole("link", {
    name: "Sapper Claude Percival Wells",
  });
  await tunneller.hover();
  await tunneller.click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(/tunnellers\/895/);
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

test("scroll position is saved and restored when navigating", async ({
  page,
}) => {
  await page.goto("/tunnellers");
  await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
  await page.getByRole("button", { name: "Go to page 3", exact: true }).click();
  await page.getByRole("link", { name: "Sapper Jeremiah Branigan" }).click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(/tunnellers\/70/);
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
