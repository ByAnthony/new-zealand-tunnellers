import { test, expect } from "@playwright/test";

test("can navigate to the history section on the homepage", async ({
  page,
}) => {
  await page.goto("/about-us/");

  const history = page.getByRole("link", { name: "History" });

  await expect(history).toBeVisible();
  await history.click();

  await expect(page.getByText(/History of the Company/)).toBeInViewport();
  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(/#history/);
});

test("can navigate to the tunnellers page", async ({ page }) => {
  await page.goto("/about-us/");

  const tunnellers = page.getByRole("link", { name: "Tunnellers" });

  await expect(tunnellers).toBeVisible();
  await tunnellers.click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(/tunnellers/);
});

test("can navigate to the resources section on the homepage", async ({
  page,
}) => {
  await page.goto("/about-us/");

  const resources = page.getByRole("link", { name: "Resources" });

  await expect(resources).toBeVisible();
  await resources.click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(/#resources/);
  await expect(page.getByText("Resources to Explore")).toBeInViewport();
});

test("can navigate to the about us page", async ({ page }) => {
  await page.goto("/tunnellers/");

  const aboutUs = page.getByRole("link", { name: "About Us" });

  await expect(aboutUs).toBeVisible();
  await aboutUs.click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(/about-us/);
});

test("can click on the Artois University logo", async ({ page }) => {
  await page.goto("/about-us/");

  const logo = page.getByLabel("Go to The Artois University website");

  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("target", "_blank");
});

test("can click on the irsem logo", async ({ page }) => {
  await page.goto("/about-us/");

  const logo = page.getByLabel(
    "Go to The Institute for Strategic Research website",
  );

  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("target", "_blank");
});
