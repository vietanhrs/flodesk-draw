import { registry, type PageElement } from "@src/pages/Editor/elements";
import {
  escapeHtml,
  styleString,
} from "@src/pages/Editor/elements/shared/html";
import type { PageData, PageRow } from "@src/pages/Editor/state/types";

const renderElement = (el: PageElement): string => {
  const handler = registry[el.type] as { toHtml: (el: PageElement) => string };
  return handler.toHtml(el);
};

const renderRow = (row: PageRow): string => {
  const totalWidth = row.columnWidths.reduce((a, b) => a + b, 0) || 1;
  const rowStyle = styleString({
    "background-color": row.backgroundColor,
    "padding-left": `${row.paddingX}px`,
    "padding-right": `${row.paddingX}px`,
    "padding-top": `${row.paddingY}px`,
    "padding-bottom": `${row.paddingY}px`,
    "margin-top": `${row.marginY}px`,
    "margin-bottom": `${row.marginY}px`,
  });
  const gridStyle = styleString({
    display: "grid",
    "grid-template-columns": row.columnWidths
      .map((w) => `${(w / totalWidth) * 100}fr`)
      .join(" "),
    gap: `${row.columnGap}px`,
    "align-items": "start",
  });
  const cols = row.columns
    .map((col) => {
      const items = col.map(renderElement).join("");
      const colStyle = styleString({
        display: "flex",
        "flex-direction": "column",
        gap: "16px",
      });
      return `<div style="${colStyle}">${items}</div>`;
    })
    .join("");
  return `<section style="${rowStyle}"><div style="${gridStyle}">${cols}</div></section>`;
};

export const buildHtml = (page: PageData): string => {
  const pageStyle = styleString({
    "background-color": page.backgroundColor,
    "padding-left": `${page.paddingX}px`,
    "padding-right": `${page.paddingX}px`,
    "padding-top": `${page.paddingY}px`,
    "padding-bottom": `${page.paddingY}px`,
    "min-height": "100vh",
    "font-family": "'Helvetica Neue', Arial, sans-serif",
    color: "#1f1f1f",
  });
  const rows = page.rows.map(renderRow).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(page.title || "Untitled page")}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  img { max-width: 100%; }
  @media (max-width: 640px) {
    section > div[style*="grid"] {
      grid-template-columns: 1fr !important;
    }
  }
</style>
</head>
<body>
  <main style="${pageStyle}">
    ${rows}
  </main>
</body>
</html>`;
};
