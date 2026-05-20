import { expect, test as base } from "@playwright/test";

const allowedConsoleErrorPatterns = [
  /Accessing element\.ref was removed in React 19/,
];

const isAllowedConsoleError = (text: string) =>
  allowedConsoleErrorPatterns.some((pattern) => pattern.test(text));

export const test = base.extend({
  page: async ({ page }, runTestPage) => {
    const unexpectedConsoleErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (isAllowedConsoleError(text)) return;

      const location = message.location();
      const source = location.url
        ? ` (${location.url}:${location.lineNumber}:${location.columnNumber})`
        : "";
      unexpectedConsoleErrors.push(`console.error: ${text}${source}`);
    });

    page.on("pageerror", (error) => {
      unexpectedConsoleErrors.push(
        `pageerror: ${error.stack ?? error.message}`
      );
    });

    await runTestPage(page);

    expect(unexpectedConsoleErrors).toEqual([]);
  },
});

export { expect };
