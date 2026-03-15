import { test, expect } from "@playwright/test";

const EN_CONTENTS = "/books/kiwis-dig-tunnels-too";
const FR_CONTENTS = "/books/les-kiwis-aussi-creusent-des-tunnels";
const EN_CHAPTER_1 =
  "/books/kiwis-dig-tunnels-too/chapter-1-the-tunnellers-from-the-antipodes";
const FR_CHAPTER_1 =
  "/books/les-kiwis-aussi-creusent-des-tunnels/chapitre-1-les-tunneliers-des-antipodes";

// ─── Contents page ───────────────────────────────────────────────────────────

test("EN contents: loads title, chapter list and Resources link", async ({
  page,
}) => {
  await page.goto(EN_CONTENTS);

  await expect(
    page.getByRole("heading", { name: "Kiwis Dig Tunnels Too" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Go to chapter 1: The Tunnellers from the Antipodes"),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to the Resources section" }),
  ).toBeVisible();
});

test("FR contents: loads title, chapter list and Resources link", async ({
  page,
}) => {
  await page.goto(FR_CONTENTS);

  await expect(
    page.getByRole("heading", {
      name: "Les Kiwis aussi creusent des tunnels",
    }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Aller au chapitre 1 : Les tunneliers des antipodes"),
  ).toBeVisible();
  await expect(page.getByLabel("Aller à la section Ressources")).toBeVisible();
});

test("EN contents: clicking a chapter navigates to the correct URL", async ({
  page,
}) => {
  await page.goto(EN_CONTENTS);

  await page
    .getByLabel("Go to chapter 1: The Tunnellers from the Antipodes")
    .click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(
    /books\/kiwis-dig-tunnels-too\/chapter-1-the-tunnellers-from-the-antipodes/,
  );
});

test("FR contents: clicking a chapter navigates to the correct URL", async ({
  page,
}) => {
  await page.goto(FR_CONTENTS);

  await page
    .getByLabel("Aller au chapitre 1 : Les tunneliers des antipodes")
    .click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(
    /books\/les-kiwis-aussi-creusent-des-tunnels\/chapitre-1-les-tunneliers-des-antipodes/,
  );
});

// ─── Chapter page ─────────────────────────────────────────────────────────────

test("EN chapter: shows heading, chapter number and reading time", async ({
  page,
}) => {
  await page.goto(EN_CHAPTER_1);

  await expect(
    page.getByRole("heading", {
      name: "The Tunnellers from the Antipodes",
    }),
  ).toBeVisible();
  await expect(page.getByText("Chapter 1", { exact: true })).toBeVisible();
  await expect(page.getByText(/min read/)).toBeVisible();
});

test("FR chapter: shows heading, chapter number and reading time in French", async ({
  page,
}) => {
  await page.goto(FR_CHAPTER_1);

  await expect(
    page.getByRole("heading", { name: "Les tunneliers des antipodes" }),
  ).toBeVisible();
  await expect(page.getByText("Chapitre 1", { exact: true })).toBeVisible();
  await expect(page.getByText(/min de lecture/)).toBeVisible();
});

test("EN chapter: breadcrumb navigates to Resources and table of contents", async ({
  page,
}) => {
  await page.goto(EN_CHAPTER_1);

  const resourcesLink = page.getByLabel("Go to the Resources section");
  await expect(resourcesLink).toBeVisible();
  await expect(resourcesLink).toHaveAttribute("href", "/#resources");

  await page.getByRole("link", { name: "Go to the table of contents" }).click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(/books\/kiwis-dig-tunnels-too/);
});

test("FR chapter: breadcrumb navigates to Resources and table of contents", async ({
  page,
}) => {
  await page.goto(FR_CHAPTER_1);

  const resourcesLink = page.getByLabel("Aller à la section Ressources");
  await expect(resourcesLink).toBeVisible();
  await expect(resourcesLink).toHaveAttribute("href", "/fr/#resources");

  await page.getByRole("link", { name: "Aller au sommaire" }).click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(/books\/les-kiwis-aussi-creusent-des-tunnels/);
});

test("reading progress bar is visible on chapter pages", async ({ page }) => {
  await page.goto(EN_CHAPTER_1);
  await page.evaluate(() => window.scrollTo(0, 300));

  await expect(
    page.getByRole("progressbar", { name: "Reading progress" }),
  ).toBeVisible();
});

test("sources page has no progress bar and no BookMenu", async ({ page }) => {
  await page.goto(`${EN_CONTENTS}/sources`);

  await expect(page.getByRole("progressbar")).not.toBeAttached();
  await expect(page.getByLabel("Back to contents")).not.toBeAttached();
});

test("FR sources page has no progress bar and no BookMenu", async ({
  page,
}) => {
  await page.goto(`${FR_CONTENTS}/sources`);

  await expect(page.getByRole("progressbar")).not.toBeAttached();
  await expect(page.getByLabel("Retour au sommaire")).not.toBeAttached();
});

test("BookMenu is visible when scrolling down a chapter", async ({ page }) => {
  await page.goto(EN_CHAPTER_1);
  await page.evaluate(() => window.scrollTo(0, 300));

  await expect(page.getByLabel("Back to contents")).toBeVisible();
});

// ─── Next chapter button ──────────────────────────────────────────────────────

test("EN: next chapter button navigates to chapter 2", async ({ page }) => {
  await page.goto(EN_CHAPTER_1);

  await page.getByLabel("Go to chapter 2: Forging Good Soldiers").click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(
    /books\/kiwis-dig-tunnels-too\/chapter-2-forging-good-soldiers/,
  );
});

test("FR: next chapter button navigates to chapitre 2", async ({ page }) => {
  await page.goto(FR_CHAPTER_1);

  await page
    .getByLabel("Aller au chapitre 2 : En faire de bons soldats")
    .click();

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(
    /books\/les-kiwis-aussi-creusent-des-tunnels\/chapitre-2-en-faire-de-bons-soldats/,
  );
});

// ─── Progress ring on contents page ──────────────────────────────────────────

test("progress ring shows arrow after partial scroll", async ({ page }) => {
  await page.goto(EN_CHAPTER_1);
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(100);

  await page.getByLabel("Back to contents").click();
  await page.waitForLoadState("domcontentloaded");

  const chapter1Link = page.getByLabel(
    "Go to chapter 1: The Tunnellers from the Antipodes",
  );
  await expect(chapter1Link).toContainText("→");
  await expect(chapter1Link).not.toContainText("✓");
});

test("progress ring shows tick after scrolling to the bottom of a chapter", async ({
  page,
}) => {
  await page.goto(EN_CHAPTER_1);
  await page.locator(".footnotes").scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);

  await page.getByLabel("Back to contents").click();
  await page.waitForLoadState("domcontentloaded");

  const chapter1Link = page.getByLabel(
    "Go to chapter 1: The Tunnellers from the Antipodes",
  );
  await expect(chapter1Link).toContainText("✓");
});

// ─── HowToCite ────────────────────────────────────────────────────────────────

test("EN HowToCite: shows correct citation for a book chapter", async ({
  page,
}) => {
  await page.goto(EN_CHAPTER_1);

  await expect(
    page.getByRole("heading", { name: "How to cite this page" }),
  ).toBeVisible();

  const citation = page.locator("[class*='howtocite'] p");
  await expect(citation).toContainText("Anthony Byledbal");
  await expect(citation).toContainText(
    "Chapter 1: The tunnellers from the antipodes",
  );
  await expect(citation).toContainText("Kiwis Dig Tunnels Too");
  await expect(citation).toContainText("Accessed");
  await expect(citation).toContainText(
    "www.nztunnellers.com/books/kiwis-dig-tunnels-too/chapter-1-the-tunnellers-from-the-antipodes",
  );
});

test("FR HowToCite: shows correct citation for a book chapter", async ({
  page,
}) => {
  await page.goto(FR_CHAPTER_1);

  await expect(
    page.getByRole("heading", { name: "Comment citer cette page" }),
  ).toBeVisible();

  const citation = page.locator("[class*='howtocite'] p");
  await expect(citation).toContainText("Anthony Byledbal");
  await expect(citation).toContainText(
    "Chapitre 1: Les tunneliers des antipodes",
  );
  await expect(citation).toContainText("Les Kiwis aussi creusent des tunnels");
  await expect(citation).toContainText("Consulté le");
  await expect(citation).toContainText(
    "www.nztunnellers.com/fr/books/les-kiwis-aussi-creusent-des-tunnels/chapitre-1-les-tunneliers-des-antipodes",
  );
});
