import { expect, test } from "@playwright/test";
import fs from "node:fs";

test.describe("Editor export", () => {
  test("downloads the edited page as HTML", async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "showSaveFilePicker", {
        value: undefined,
      });
    });
    await page.goto("/templates/welcome-to-the-family");
    await page.getByLabel("Page title").fill("Welcome E2E Export");
    await page.getByLabel("Page title").blur();

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Build & export" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("welcome-e2e-export.html");

    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);
    const html = fs.readFileSync(filePath, "utf8");

    expect(html).toContain("<title>Welcome E2E Export</title>");
    expect(html).toContain("Hello, lovely friend.");
    expect(html).toContain("Read the journal");
    expect(html).not.toContain("<title>Untitled page</title>");

    await expect(
      page.getByText("Your page has been exported as an HTML file.")
    ).toBeVisible();
  });
});
