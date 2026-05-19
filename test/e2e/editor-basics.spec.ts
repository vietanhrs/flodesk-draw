import { expect, test } from "@playwright/test";

import { canvas, gotoEditor } from "./helpers/editor";

test.describe("Editor basics", () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test("renders no filename label when no file has been loaded", async ({
    page,
  }) => {
    await expect(page.getByLabel("Current file")).toHaveCount(0);
    // The Save affordance is always present for first-save (Save As).
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
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

  test("Flodesk logo navigates home", async ({ page }) => {
    await page.getByRole("link", { name: "Flodesk homepage" }).click();

    // `/` redirects to `/templates`.
    await expect(page).toHaveURL(/\/templates$/);
  });
});
