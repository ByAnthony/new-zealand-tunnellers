import { expect, Page, test } from "@playwright/test";

async function openFirstOriginDrawer(page: Page) {
  await page.goto("/tunnellers/?view=map");
  await expect(page.getByTestId("roll-origin-map")).toBeVisible();
  const firstMarker = page.locator(".leaflet-interactive").first();
  await expect(firstMarker).toBeVisible();
  await firstMarker.click({ force: true });
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("roll origin map shows controls without unmapped origin action", async ({
  page,
}) => {
  await page.goto("/tunnellers/?view=map");

  await expect(page.getByTestId("roll-origin-map")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open the tunnellers roll list" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Toggle filters" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Zoom out" })).toBeVisible();
  await expect(page.getByText("936 results")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /unmapped/i }),
  ).not.toBeVisible();
});

test("origin drawer spans mobile and tablet widths only", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openFirstOriginDrawer(page);

  const mobileDrawer = page.getByRole("dialog");
  await expect(mobileDrawer).toBeVisible();
  await expect(mobileDrawer).toHaveJSProperty("clientWidth", 390);

  await page.getByRole("button", { name: "Close" }).click();
  await expect(mobileDrawer).not.toBeVisible();

  await page.setViewportSize({ width: 768, height: 1024 });
  await openFirstOriginDrawer(page);

  const tabletDrawer = page.getByRole("dialog");
  await expect(tabletDrawer).toBeVisible();
  await expect(tabletDrawer).toHaveJSProperty("clientWidth", 768);

  await page.getByRole("button", { name: "Close" }).click();
  await expect(tabletDrawer).not.toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await openFirstOriginDrawer(page);

  const desktopDrawer = page.getByRole("dialog");
  await expect(desktopDrawer).toBeVisible();
  await expect(desktopDrawer).toHaveJSProperty("clientWidth", 380);
});
