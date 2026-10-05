import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`hero stays pinned while content scrolls over it (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const hero = page.locator("#hero");
    const content = page.locator("#history").locator("..");
    await expect(hero).toBeVisible();
    const initialContentTop = await content.evaluate(
      (element) => element.getBoundingClientRect().top,
    );

    await page.evaluate(() => {
      window.scrollTo({ top: 300, behavior: "instant" });
    });

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(300);
    await expect
      .poll(() =>
        hero.evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBe(0);
    const layout = await content.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return {
        top: bounds.top,
        width: bounds.width,
        viewportWidth: document.documentElement.clientWidth,
        background: style.backgroundColor,
        mask: style.maskImage,
        coversHero: element.contains(
          document.elementFromPoint(bounds.width / 2, bounds.top + 5),
        ),
      };
    });

    expect(layout.top).toBeLessThan(initialContentTop);
    expect(layout.width).toBe(layout.viewportWidth);
    expect(layout.background).toBe("rgb(24, 26, 27)");
    expect(layout.mask).toBe("none");
    expect(layout.coversHero).toBe(true);
  });
}

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
