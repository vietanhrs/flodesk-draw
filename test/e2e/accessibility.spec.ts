import { expect, test } from "./fixtures";

test.describe("Accessibility smoke checks", () => {
  test("the templates page exposes navigable categories and template actions", async ({
    page,
  }) => {
    await page.goto("/templates");

    await expect(
      page.getByRole("navigation", { name: "Template categories" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open template: Bold sale announcement" })
    ).toBeVisible();
  });

  test("the editor exposes a configuration aside and viewport radio group", async ({
    page,
  }) => {
    await page.goto("/templates/bold-sale-announcement");

    await expect(
      page.getByRole("complementary", { name: "Configuration" })
    ).toBeVisible();
    await expect(
      page.getByRole("radiogroup", { name: "Viewport" })
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Desktop view" })
    ).toHaveAttribute("aria-checked", "true");
  });

  test("the mobile editor chrome shows its status notice and keeps the canvas visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/templates/bold-sale-announcement");

    await expect(page.getByRole("status")).toContainText(
      "Please switch to desktop"
    );
    await expect(page.getByTestId("editor-canvas")).toBeVisible();
  });
});
