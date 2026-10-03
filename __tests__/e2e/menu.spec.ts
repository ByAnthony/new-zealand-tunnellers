import { test, expect } from "@playwright/test";

import { makeMessagesTranslator } from "../../test-utils/getMessageFromMessages";

const translate = makeMessagesTranslator("en");
const menu = translate("menu");
const nav = translate("nav");

async function openNavigationDialog(
  page: import("@playwright/test").Page,
  locale: "en" | "fr" = "en",
) {
  const t = makeMessagesTranslator(locale);
  await page
    .getByRole("button", { name: t("menu")("openMenu"), exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: t("nav")("closeMenu"), exact: true }),
  ).toBeVisible();
}

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
  await page.goto("/tunnellers/");

  const logo = page.getByRole("link", {
    name: nav("goToHomepage"),
    exact: true,
  });
  await logo.click();

  await expect(page).toHaveURL("/");
});

test("can search for a name", async ({ page }) => {
  await page.goto("/");

  const search = page.locator("input");
  expect(search).toHaveAttribute("placeholder", menu("searchPlaceholder"));

  const input = "james williamson";
  expect(search.inputValue()).toBeNull;

  await typeIntoSearch(search, input);
  expect(
    await page.getByRole("textbox", { name: menu("searchAlt") }).inputValue(),
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

  const search = page.getByPlaceholder(menu("searchPlaceholder"));
  await typeIntoSearch(search, "joseph");
  await expect(search).toHaveValue("joseph");
  await expect(page.getByTestId("dropdown")).toBeVisible();
  await Promise.all([
    page.waitForURL("/tunnellers/joseph-kelly--37713/", {
      waitUntil: "domcontentloaded",
    }),
    page
      .getByLabel(
        menu("seeTunnellerProfile", { forename: "Joseph", surname: "Kelly" }),
      )
      .click(),
  ]);

  await expect(page).toHaveURL("/tunnellers/joseph-kelly--37713/");
});

test("can close the dropdown by clicking outside", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder(menu("searchPlaceholder"));
  await typeIntoSearch(search, "james");
  const resultLink = page
    .getByLabel(
      menu("seeTunnellerProfile", { forename: "James", surname: "Williamson" }),
    )
    .first();
  await expect(resultLink).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  await page.locator("body").click({ position: { x: 10, y: 300 } });

  await expect(page.getByTestId("dropdown")).not.toBeVisible();
});

test("can reopen the dropdown by clicking the search", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder(menu("searchPlaceholder"));
  await typeIntoSearch(search, "james");
  await expect(
    page
      .getByLabel(
        menu("seeTunnellerProfile", {
          forename: "James",
          surname: "Williamson",
        }),
      )
      .first(),
  ).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  await page.mouse.click(1, 1);
  await expect(page.getByTestId("dropdown")).not.toBeVisible();

  await page.getByPlaceholder(menu("searchPlaceholder")).click();
  await expect(page.getByTestId("dropdown")).toBeVisible();
});

test("can clear a name", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder(menu("searchPlaceholder"));
  const clearButton = page.getByRole("button", { name: menu("clearSearch") });

  await typeIntoSearch(search, "david");
  await expect(search).toHaveValue("david");
  await expect(clearButton).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  await clearButton.click();

  await typeIntoSearch(search, "");
  await expect(search).toHaveValue("");
  await expect(page.getByTestId("dropdown")).not.toBeVisible();
  await expect(search).toHaveAttribute(
    "placeholder",
    menu("searchPlaceholder"),
  );
});

test("can switch from English to French", async ({ page }) => {
  await page.goto("/");

  await openNavigationDialog(page);
  await page.getByRole("link", { name: "Français" }).click();
  await page.waitForURL("/fr/", { waitUntil: "load" });

  await expect(page).toHaveURL("/fr/");
  await openNavigationDialog(page, "fr");
  await expect(page.getByRole("link", { name: "English" })).toBeVisible();
});

test("can switch from French to English", async ({ page }) => {
  await page.goto("/fr/");

  await openNavigationDialog(page, "fr");
  await page.getByRole("link", { name: "English" }).click();
  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveURL("/");
  await openNavigationDialog(page);
  await expect(page.getByRole("link", { name: "Français" })).toBeVisible();
});

test("can go to the tunnellers page", async ({ page }) => {
  await page.goto("/");

  const search = page.getByPlaceholder(menu("searchPlaceholder"));
  await typeIntoSearch(search, "david");
  await expect(
    page
      .getByRole("link", {
        name: new RegExp(
          menu("seeTunnellerProfile", { forename: "David", surname: ".*" }),
        ),
      })
      .first(),
  ).toBeVisible();
  await expect(page.getByTestId("dropdown")).toBeVisible();

  const link = page.getByRole("link", { name: menu("seeAllTunnellers") });
  await expect(link).toBeVisible();

  await link.click();
  await expect(page).toHaveURL("/tunnellers/");
  await expect(page.getByTestId("dropdown")).not.toBeVisible();
});
