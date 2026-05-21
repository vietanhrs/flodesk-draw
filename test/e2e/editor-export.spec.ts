import fs from "node:fs";

import { expect, test } from "./fixtures";

test.describe("Editor export", () => {
  test("downloads the edited page as HTML using the template title", async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "showSaveFilePicker", {
        value: undefined,
      });
    });
    await page.goto("/templates/welcome-to-the-family");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Build & export" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("welcome-to-the-family.html");

    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);
    const html = fs.readFileSync(filePath, "utf8");

    expect(html).toContain("<title>Welcome to the family</title>");
    expect(html).toContain("Hello, lovely friend.");
    expect(html).toContain("Read the journal");
    expect(html).not.toContain("<title>Untitled page</title>");

    await expect(
      page.getByText("Your page has been exported as an HTML file.")
    ).toBeVisible();
  });

  test("falls back to download when picker writing fails after selection", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "showSaveFilePicker", {
        configurable: true,
        value: () =>
          Promise.resolve({
            createWritable: () =>
              Promise.resolve({
                write: () => Promise.reject(new Error("disk full")),
                close: () => Promise.resolve(undefined),
              }),
          }),
      });
    });

    await page.goto("/templates/welcome-to-the-family");
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Build & export" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("welcome-to-the-family.html");
    await expect(
      page.getByText("Your page has been exported as an HTML file.")
    ).toBeVisible();
  });
});
