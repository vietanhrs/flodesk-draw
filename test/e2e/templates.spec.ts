import { expect, test } from "./fixtures";

test.describe("Template gallery", () => {
  test("redirects home to the template gallery", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/templates$/);
    await expect(
      page.getByRole("heading", { name: "What's your goal?" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open template: Bold sale announcement" })
    ).toBeVisible();
  });

  test("filters templates by category on desktop", async ({ page }) => {
    await page.goto("/templates");

    const categories = page.getByRole("navigation", {
      name: "Template categories",
    });
    await categories
      .getByRole("link", { name: "Welcome", exact: true })
      .click();

    await expect(page).toHaveURL(/category=welcome/);
    await expect(
      page.getByRole("heading", { name: "Welcome to the family" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bold sale announcement" })
    ).toBeHidden();
    await expect(
      categories.getByRole("link", { name: "Welcome", exact: true })
    ).toHaveAttribute("aria-current", "page");
  });

  test("opens a template in the editor", async ({ page }) => {
    await page.goto("/templates");

    await page
      .getByRole("link", { name: "Open template: Bold sale announcement" })
      .click();

    await expect(page).toHaveURL(/\/templates\/bold-sale-announcement$/);
    // No filename label when starting from a template (the user hasn't saved
    // a `.flodesk` file yet).
    await expect(page.getByLabel("Current file")).toHaveCount(0);
    await expect(page.getByText("70% OFF")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Build & export" })
    ).toBeVisible();
  });

  test("uses the mobile category picker to start from scratch", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/templates");

    await page.getByRole("button", { name: "Browse all" }).click();
    await page.getByRole("option", { name: "Start from scratch" }).click();

    await expect(page).toHaveURL(/\/editor$/);
    // Empty starter shows the Save affordance but no filename label.
    await expect(page.getByLabel("Current file")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });
});
