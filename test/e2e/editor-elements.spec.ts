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
