import { test, expect } from "@playwright/test";

test("redirects legacy numeric id url to slug url", async ({ page }) => {
  await page.goto("/tunnellers/274");
  await expect(page).toHaveURL(/tunnellers\/clifford-james-flewellyn--3_1655/);
});

test("redirects legacy numeric id wwi-timeline url to slug url", async ({
  page,
}) => {
  await page.goto("/tunnellers/274/wwi-timeline");
  await expect(page).toHaveURL(
    /tunnellers\/clifford-james-flewellyn--3_1655\/wwi-timeline/,
  );
});

test("can click on Tunnellers to go to Tunnellers list", async ({ page }) => {
  await page.goto("/tunnellers/clifford-james-flewellyn--3_1655");

  await page.getByRole("link", { name: "Tunnellers" }).first().click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(/tunnellers/);
});

test("can click on timeline button", async ({ page }) => {
  await page.goto("/tunnellers/clifford-james-flewellyn--3_1655");
  await page.getByLabel(/Open the World War I timeline/).click();
  await expect(page).toHaveURL(
    /tunnellers\/clifford-james-flewellyn--3_1655\/wwi-timeline/,
  );
});

test("can click on awmm link", async ({ page }) => {
  await page.goto("/tunnellers/clifford-james-flewellyn--3_1655");
  const link = await page.getByRole("link", { name: "Online Cenotaph He Toa" });
  await expect(link).toHaveAttribute("target", "_blank");
});

test("can click on the tunnellers link", async ({ page }) => {
  await page.goto("/tunnellers/clifford-james-flewellyn--3_1655");
  const link = await page.getByRole("link", {
    name: "Military Personnel File",
  });
  await expect(link).toHaveAttribute("target", "_blank");
});
