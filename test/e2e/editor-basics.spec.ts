import { expect, test } from "@playwright/test";

import { canvas, gotoEditor } from "./helpers/editor";

test.describe("Editor basics", () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test("edits the page title and persists it across reloads", async ({
    page,
  }) => {
    await page.getByLabel("Page title").fill("Launch announcement");
    await page.keyboard.press("Enter");

    await expect(page.getByLabel("Page title")).toHaveValue(
      "Launch announcement"
    );

    await page.reload();

    await expect(page.getByLabel("Page title")).toHaveValue(
      "Launch announcement"
    );
  });

  test("toggles desktop and mobile canvas widths", async ({ page }) => {
    await expect(
      page.getByRole("radio", { name: "Desktop view" })
    ).toHaveAttribute("aria-checked", "true");
    await expect(canvas(page)).toHaveCSS("max-width", "1080px");

    await page.getByRole("radio", { name: "Mobile view" }).click();

    await expect(
      page.getByRole("radio", { name: "Mobile view" })
    ).toHaveAttribute("aria-checked", "true");
    await expect(canvas(page)).toHaveCSS("max-width", "390px");
  });

  test("updates page background from the configuration pane", async ({
    page,
  }) => {
    await page.getByLabel("Background value").fill("#f1eee7");
    await page.getByLabel("Background value").blur();

    await expect(canvas(page)).toHaveCSS(
      "background-color",
      "rgb(241, 238, 231)"
    );
  });

  test("navigates back to templates", async ({ page }) => {
    await page.getByLabel("Back to templates").click();

    await expect(page).toHaveURL(/\/templates$/);
  });
});
