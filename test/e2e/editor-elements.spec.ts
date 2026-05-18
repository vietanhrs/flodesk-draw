import { expect, test } from "@playwright/test";

import {
  addElementToFirstColumn,
  canvasElement,
  firstColumn,
  gotoEditor,
  rows,
} from "./helpers/editor";

test.describe("Editor elements", () => {
  test.beforeEach(async ({ page }) => {
    await gotoEditor(page);
  });

  test("searches the element menu and adds a heading by drag and drop", async ({
    page,
  }) => {
    await page.getByLabel("Search elements").fill("heading");

    await expect(
      page.getByRole("button", { name: "Drag to add Heading" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Drag to add Paragraph" })
    ).toBeHidden();

    await addElementToFirstColumn(page, "Heading");

    await expect(canvasElement(page, "heading").last()).toContainText(
      "Headline text"
    );
  });

  test("edits a selected text element and supports undo and redo", async ({
    page,
  }) => {
    const heading = canvasElement(page, "heading").first();
    await heading.click();

    await page.getByLabel("Text").fill("A calmer launch");
    await expect(heading).toContainText("A calmer launch");

    await page.getByRole("button", { name: "Undo" }).click();
    await expect(heading).toContainText("Build something beautiful");

    await page.getByRole("button", { name: "Redo" }).click();
    await expect(heading).toContainText("A calmer launch");
  });

  test("adds a button element and edits its label", async ({ page }) => {
    await page.getByRole("button", { name: "Buttons" }).click();
    await addElementToFirstColumn(page, "Button");

    const addedButton = canvasElement(page, "button").last();
    await addedButton.click();
    await page.getByLabel("Label").fill("Join the list");

    await expect(page.getByText("Join the list")).toBeVisible();
  });

  test("reorders elements within a column by dragging one above another", async ({
    page,
  }) => {
    // Use the bold-sale-announcement template — its first row has five
    // elements in a deterministic order, so reordering is observable.
    await gotoEditor(page, "/templates/bold-sale-announcement");

    const column = firstColumn(page);
    const heading = column.locator(".edt-element").filter({
      has: page.locator("h1"),
    });
    const firstParagraph = column.locator(".edt-element").first();

    // Before: paragraph "BLACK FRIDAY" is first, heading "70% OFF" is second.
    await expect(firstParagraph).toContainText("BLACK FRIDAY");

    // Drag the heading just above the first paragraph — landing at insert
    // index 0 in the column.
    await heading.dragTo(firstParagraph, {
      targetPosition: { x: 8, y: 2 },
    });

    // After: the heading is the first .edt-element in the column.
    await expect(column.locator(".edt-element").first()).toContainText(
      "70% OFF"
    );
  });

  test("shows the selected element's name above the form in the Element tab", async ({
    page,
  }) => {
    const heading = canvasElement(page, "heading").first();
    await heading.click();

    // The Element tab is auto-selected on element click; the catalog name
    // "Heading" should appear as a heading above the form.
    const configAside = page.getByLabel("Configuration");
    await expect(
      configAside.getByRole("heading", { name: "Heading" })
    ).toBeVisible();
  });

  test("adds, duplicates, moves, and deletes rows", async ({ page }) => {
    await rows(page).first().hover();
    await page.getByRole("button", { name: "Add row below" }).click();

    await expect(rows(page)).toHaveCount(2);

    await firstColumn(page).click();
    await rows(page).first().hover();
    await page.getByRole("button", { name: "Move row down" }).click();
    await expect(rows(page).nth(1)).toContainText("Build something beautiful");

    await page.getByTestId("canvas-row-2").click();
    await page.getByRole("button", { name: "Duplicate row" }).click();
    await expect(rows(page)).toHaveCount(3);

    await page.getByRole("button", { name: "Delete row" }).click();
    await expect(rows(page)).toHaveCount(2);
  });
});
