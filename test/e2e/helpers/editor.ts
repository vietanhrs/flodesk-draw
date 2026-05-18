import { expect, type Page } from "@playwright/test";

export const gotoEditor = async (page: Page, path = "/editor") => {
  await page.goto(path);
  await expect(page.getByLabel("Page title")).toBeVisible();
};

export const canvas = (page: Page) => page.getByTestId("editor-canvas");

export const rows = (page: Page) => page.getByTestId("canvas-row");

export const firstColumn = (page: Page) =>
  page.getByTestId("canvas-column-1-1");

export const elementCard = (page: Page, name: string) =>
  page.getByRole("button", { name: `Drag to add ${name}` });

export const canvasElement = (page: Page, type: string) =>
  page.getByRole("button", { name: `${type} element` });

export const addElementToFirstColumn = async (page: Page, name: string) => {
  await elementCard(page, name).dragTo(firstColumn(page));
  await expect(canvasElement(page, name.toLowerCase()).last()).toBeVisible();
};
