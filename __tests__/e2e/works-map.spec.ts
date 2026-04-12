import { expect, test } from "@playwright/test";

const J3_WORK_ID = 476;
const J3_WORK_NAME = "J3";

test("switching map periods replaces the active period in the URL", async ({
  page,
}) => {
  await page.goto("/maps/tunnellers-works");

  const filtersButton = page.getByRole("button", { name: "Filters" });
  await expect(filtersButton).toBeVisible();

  await filtersButton.click();
  await page
    .getByRole("button", { name: /Preparations for the Battle of Arras/i })
    .click();
  await page.getByRole("button", { name: "Done" }).click();

  await expect(page).toHaveURL(/period=true/);
  await expect(page).toHaveURL(/from=1916-11-16/);
  await expect(page).toHaveURL(/to=1917-04-09/);

  await filtersButton.click();
  await page
    .getByRole("button", {
      name: /Preparations for the Hundred Days Offensive/i,
    })
    .click();
  await page.getByRole("button", { name: "Done" }).click();

  await expect(page).toHaveURL(/period=true/);
  await expect(page).toHaveURL(/from=1918-07-15/);
  await expect(page).toHaveURL(/to=1918-09-26/);
  await expect(page).not.toHaveURL(/1916-11-16|1917-04-09/);
});

test("deep-link restore opens a visible work and ignores the same work when hidden by filters", async ({
  page,
}) => {
  await page.goto(
    `/maps/tunnellers-works?work=${J3_WORK_ID}&period=true&from=1916-03-16&to=1916-11-15`,
  );
  await expect(page.getByText(J3_WORK_NAME, { exact: true })).toBeVisible();

  await page.goto(
    `/maps/tunnellers-works?work=${J3_WORK_ID}&period=true&from=1918-07-15&to=1918-09-26`,
  );
  await expect(page.getByText(J3_WORK_NAME, { exact: true })).not.toBeVisible();
});

test("changing to a period that excludes the selected work closes the info bar", async ({
  page,
}) => {
  await page.goto(`/maps/tunnellers-works?work=${J3_WORK_ID}`);
  await expect(page.getByText(J3_WORK_NAME, { exact: true })).toBeVisible();

  const filtersButton = page.getByRole("button", { name: "Filters" });
  await filtersButton.click();
  await page
    .getByRole("button", {
      name: /Preparations for the Hundred Days Offensive/i,
    })
    .click();
  await page.getByRole("button", { name: "Done" }).click();

  await expect(page.getByText(J3_WORK_NAME, { exact: true })).not.toBeVisible();
});
