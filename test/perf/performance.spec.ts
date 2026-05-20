import { expect, test, type Page } from "@playwright/test";

interface PerfBudget {
  path: string;
  name: string;
  readySelector: string;
  viewport: { width: number; height: number };
  maxDomContentLoadedMs: number;
  maxLoadMs: number;
  maxEncodedResourceBytes: number;
}

const KiB = 1024;

const budgets: PerfBudget[] = [
  {
    name: "template gallery desktop",
    path: "/templates",
    readySelector: "text=Start from scratch",
    viewport: { width: 1440, height: 1000 },
    maxDomContentLoadedMs: 5_000,
    maxLoadMs: 6_000,
    maxEncodedResourceBytes: 950 * KiB,
  },
  {
    name: "template gallery mobile",
    path: "/templates",
    readySelector: ".tpl-mobile",
    viewport: { width: 390, height: 844 },
    maxDomContentLoadedMs: 5_500,
    maxLoadMs: 6_500,
    maxEncodedResourceBytes: 950 * KiB,
  },
  {
    name: "blank editor desktop",
    path: "/editor",
    readySelector: "[data-testid='editor-canvas']",
    viewport: { width: 1440, height: 1000 },
    maxDomContentLoadedMs: 5_500,
    maxLoadMs: 6_500,
    maxEncodedResourceBytes: 1_050 * KiB,
  },
  {
    name: "template editor desktop",
    path: "/templates/bold-sale-announcement",
    readySelector: "text=70% OFF",
    viewport: { width: 1440, height: 1000 },
    maxDomContentLoadedMs: 5_500,
    maxLoadMs: 6_500,
    maxEncodedResourceBytes: 1_050 * KiB,
  },
];

const collectPerfMetrics = async (page: Page) =>
  page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];

    return {
      domContentLoadedMs:
        navigation.domContentLoadedEventEnd - navigation.startTime,
      loadMs: navigation.loadEventEnd - navigation.startTime,
      encodedResourceBytes: resources.reduce(
        (total, resource) => total + resource.encodedBodySize,
        0
      ),
    };
  });

test.describe("Performance budgets", () => {
  for (const budget of budgets) {
    test(budget.name, async ({ page }) => {
      await page.setViewportSize(budget.viewport);
      await page.goto(budget.path, { waitUntil: "load" });
      await page.locator(budget.readySelector).first().waitFor();

      const metrics = await collectPerfMetrics(page);

      expect(metrics.domContentLoadedMs).toBeLessThanOrEqual(
        budget.maxDomContentLoadedMs
      );
      expect(metrics.loadMs).toBeLessThanOrEqual(budget.maxLoadMs);
      expect(metrics.encodedResourceBytes).toBeLessThanOrEqual(
        budget.maxEncodedResourceBytes
      );
    });
  }
});
