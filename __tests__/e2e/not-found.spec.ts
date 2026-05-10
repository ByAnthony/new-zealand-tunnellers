import { test, expect } from "@playwright/test";

test("renders the custom 404 page", async ({ page }) => {
  const response = await page.goto("/missing-tunnel/");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Tunnel Not Found - New Zealand Tunnellers");
  await expect(
    page.getByRole("heading", { name: "Tunnel Not Found" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "This passage seems to have caved in or led to the wrong trench.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to the surface" }),
  ).toHaveAttribute("href", "/");
  await expect(page.locator("footer")).not.toBeVisible();

  const backgroundImage = await page
    .locator("section")
    .first()
    .evaluate(
      (element) => window.getComputedStyle(element, "::before").backgroundImage,
    );

  expect(backgroundImage).toContain("/images/not-found/Q_069984.jpg");
});

test("renders the French custom 404 page", async ({ page }) => {
  const response = await page.goto("/fr/tunnel-manquant/");

  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("Tunnel introuvable - New Zealand Tunnellers");
  await expect(
    page.getByRole("heading", { name: "Tunnel introuvable" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Ce passage semble s'être effondré ou mener à la mauvaise tranchée.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Retour à la surface" }),
  ).toHaveAttribute("href", "/fr");
  await expect(page.locator("footer")).not.toBeVisible();
});
