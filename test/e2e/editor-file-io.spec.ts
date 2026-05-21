import fs from "node:fs";

import { expect, test } from "./fixtures";
import { canvasElement } from "./helpers/editor";

// A minimal valid Flodesk draft: version 1 with a one-row, one-element page.
const sampleDraft = {
  version: 1,
  page: {
    title: "Sample draft",
    backgroundColor: "#ffffff",
    paddingX: 0,
    paddingY: 0,
    rows: [
      {
        id: "row-1",
        backgroundColor: "transparent",
        paddingX: 64,
        paddingY: 96,
        marginY: 0,
        columnsCount: 1,
        columnWidths: [1],
        columnGap: 24,
        columns: [
          [
            {
              id: "el-1",
              type: "heading",
              text: "Loaded from file",
              level: 1,
              color: "#1f1f1f",
              fontSize: 56,
              fontWeight: 600,
              fontFamily: "Georgia, 'Times New Roman', serif",
              align: "center",
              letterSpacing: -1,
            },
          ],
        ],
      },
    ],
  },
};

test.describe("Editor — file I/O", () => {
  test.beforeEach(async ({ page }) => {
    // Force the fallback <input type="file"> path so Playwright's filechooser
    // event fires (FS Access API picker is harder to drive deterministically
    // in tests).
    await page.addInitScript(() => {
      Object.defineProperty(window, "showOpenFilePicker", { value: undefined });
      Object.defineProperty(window, "showSaveFilePicker", { value: undefined });
    });
  });

  test("opens a .flodesk file from the templates sidebar and loads it", async ({
    page,
  }) => {
    await page.goto("/templates");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Open from file" }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles({
      name: "my-launch.flodesk",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(sampleDraft)),
    });

    // Editor loads with the filename in the header and the file's content
    // on the canvas.
    await expect(page).toHaveURL(/\/editor$/);
    await expect(page.getByLabel("Current file")).toHaveText("my-launch");
    await expect(page.getByText("Loaded from file")).toBeVisible();
  });

  test("rejects an invalid .flodesk file without leaving templates", async ({
    page,
  }) => {
    await page.goto("/templates");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Open from file" }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles({
      name: "broken.flodesk",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify({ version: 1, page: {} })),
    });

    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.getByRole("alert")).toContainText(
      "Flodesk file has invalid page data"
    );
  });

  test("surfaces an open-file validation error through the templates toast", async ({
    page,
  }) => {
    await page.goto("/templates");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Open from file" }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles({
      name: "unsafe-video.flodesk",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          version: 1,
          page: {
            ...sampleDraft.page,
            rows: [
              {
                ...sampleDraft.page.rows[0],
                columns: [
                  [
                    {
                      id: "video-1",
                      type: "video",
                      url: "https://example.com/embed/123",
                      widthPct: 100,
                      align: "center",
                    },
                  ],
                ],
              },
            ],
          },
        })
      ),
    });

    await expect(page).toHaveURL(/\/templates$/);
    await expect(page.getByRole("alert")).toContainText(
      "supported HTTPS video embed URL"
    );
  });

  test("saves the working page via the header Save button (fallback download)", async ({
    page,
  }, testInfo) => {
    await page.goto("/editor");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.flodesk$/);

    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as { version: number; page: unknown };

    expect(parsed.version).toBe(1);
    expect(parsed.page).toBeTruthy();
  });

  test("round-trip: open a file, edit, save downloads the edited page with the original name", async ({
    page,
  }, testInfo) => {
    await page.goto("/templates");

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Open from file" }).click();
    const chooser = await fileChooserPromise;
    await chooser.setFiles({
      name: "round-trip.flodesk",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(sampleDraft)),
    });

    await expect(page.getByLabel("Current file")).toHaveText("round-trip");
    await expect(
      page.getByRole("button", { name: "Download copy" })
    ).toBeVisible();

    const heading = canvasElement(page, "heading").first();
    await heading.click();
    await page.getByLabel("Text").fill("Edited from file");
    await expect(heading).toContainText("Edited from file");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download copy" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe("round-trip.flodesk");

    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      page: { rows: { columns: { text: string }[][][] }[] };
    };
    const serializedPage = JSON.stringify(parsed.page);
    expect(serializedPage).toContain("Edited from file");
    expect(serializedPage).not.toContain("Loaded from file");
  });
});
