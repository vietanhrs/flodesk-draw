import type {
  PageData,
  PageElement,
  PageRow,
  SocialLink,
  TextAlign,
} from "@src/pages/Editor/state/types";

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAttr = escapeHtml;

const styleString = (
  rules: Record<string, string | number | undefined>
): string => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(rules)) {
    if (value === undefined || value === null || value === "") continue;
    const css = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    parts.push(`${css}:${value}`);
  }
  return parts.join(";");
};

const justifyOf = (align: TextAlign): string =>
  align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

const socialIcon: Record<SocialLink["platform"], string> = {
  instagram: "IG",
  twitter: "TW",
  facebook: "FB",
  youtube: "YT",
  email: "@",
  website: "W",
};

const socialAria: Record<SocialLink["platform"], string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  email: "Email",
  website: "Website",
};

const renderElement = (el: PageElement): string => {
  switch (el.type) {
    case "heading": {
      const style = styleString({
        margin: 0,
        color: el.color,
        "font-size": `${el.fontSize}px`,
        "font-weight": el.fontWeight,
        "font-family": el.fontFamily,
        "letter-spacing": `${el.letterSpacing}px`,
        "line-height": 1.1,
        "text-align": el.align,
      });
      return `<h${el.level} style="${style}">${escapeHtml(el.text)}</h${el.level}>`;
    }
    case "paragraph": {
      const style = styleString({
        margin: 0,
        color: el.color,
        "font-size": `${el.fontSize}px`,
        "font-weight": el.fontWeight,
        "font-family": el.fontFamily,
        "line-height": el.lineHeight,
        "white-space": "pre-wrap",
        "text-align": el.align,
      });
      return `<p style="${style}">${escapeHtml(el.text)}</p>`;
    }
    case "quote": {
      const style = styleString({
        margin: 0,
        "font-style": "italic",
        color: el.color,
        "font-size": `${el.fontSize}px`,
        "font-family": el.fontFamily,
        "text-align": el.align,
      });
      const citeStyle = styleString({
        display: "block",
        "margin-top": "12px",
        "font-style": "normal",
        "font-size": `${Math.max(11, el.fontSize * 0.4)}px`,
        "letter-spacing": "2px",
        "text-transform": "uppercase",
        opacity: 0.7,
      });
      const cite = el.author
        ? `<cite style="${citeStyle}">${escapeHtml(el.author)}</cite>`
        : "";
      return `<blockquote style="${style}"><div>${escapeHtml(el.text)}</div>${cite}</blockquote>`;
    }
    case "button": {
      const wrapper = styleString({
        display: "flex",
        "justify-content": justifyOf(el.align),
      });
      const hasBorder =
        el.backgroundColor === "transparent" ||
        el.backgroundColor === "rgba(0,0,0,0)";
      const btn = styleString({
        display: "inline-block",
        "background-color": el.backgroundColor,
        color: el.textColor,
        padding: `${el.paddingY}px ${el.paddingX}px`,
        "border-radius": `${el.radius}px`,
        "font-size": `${el.fontSize}px`,
        "font-weight": 600,
        "letter-spacing": `${el.letterSpacing}px`,
        "text-transform": "uppercase",
        "text-decoration": "none",
        border: hasBorder ? `1px solid ${el.textColor}` : "none",
        "font-family": "'Helvetica Neue', Arial, sans-serif",
      });
      return `<div style="${wrapper}"><a href="${escapeAttr(
        el.href || "#"
      )}" style="${btn}">${escapeHtml(el.label)}</a></div>`;
    }
    case "image": {
      const wrapper = styleString({
        display: "flex",
        "justify-content": justifyOf(el.align),
      });
      const img = styleString({
        width: `${el.widthPct}%`,
        height: "auto",
        display: "block",
        "border-radius": `${el.radius}px`,
        "object-fit": "cover",
      });
      return `<div style="${wrapper}"><img src="${escapeAttr(
        el.src
      )}" alt="${escapeAttr(el.alt)}" style="${img}" /></div>`;
    }
    case "divider": {
      const margin = el.widthPct >= 100 ? "0" : `0 ${(100 - el.widthPct) / 2}%`;
      const style = styleString({
        border: 0,
        height: `${el.thickness}px`,
        "background-color": el.color,
        margin,
        width: `${el.widthPct}%`,
      });
      return `<hr style="${style}" />`;
    }
    case "spacer":
      return `<div aria-hidden="true" style="height:${el.height}px;width:100%"></div>`;
    case "video": {
      const wrapper = styleString({
        width: `${el.widthPct}%`,
        margin: "0 auto",
        position: "relative",
        "padding-bottom": `${(9 / 16) * el.widthPct}%`,
      });
      const iframe = styleString({
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
      });
      return `<div style="${wrapper}"><iframe src="${escapeAttr(
        el.url
      )}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="${iframe}"></iframe></div>`;
    }
    case "social": {
      const wrapper = styleString({
        display: "flex",
        "justify-content": justifyOf(el.align),
        gap: `${el.gap}px`,
      });
      const links = el.links
        .map((link) => {
          const a = styleString({
            display: "inline-flex",
            "align-items": "center",
            "justify-content": "center",
            width: `${el.size + 16}px`,
            height: `${el.size + 16}px`,
            "border-radius": "50%",
            border: `1px solid ${el.color}`,
            color: el.color,
            "font-size": `${el.size * 0.55}px`,
            "font-weight": 600,
            "text-decoration": "none",
            "font-family": "'Helvetica Neue', Arial, sans-serif",
          });
          return `<a href="${escapeAttr(
            link.url || "#"
          )}" aria-label="${escapeAttr(
            socialAria[link.platform]
          )}" style="${a}">${socialIcon[link.platform]}</a>`;
        })
        .join("");
      return `<div style="${wrapper}">${links}</div>`;
    }
  }
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
