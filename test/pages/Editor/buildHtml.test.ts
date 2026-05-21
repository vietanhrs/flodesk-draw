import { describe, expect, it } from "vitest";

import { buildHtml } from "@src/pages/Editor/exporter/buildHtml";
import type { PageData } from "@src/pages/Editor/state/types";

const basePage = (rows: PageData["rows"] = []): PageData => ({
  title: "Test page",
  backgroundColor: "#ffffff",
  paddingX: 16,
  paddingY: 24,
  rows,
});

describe("buildHtml", () => {
  it("wraps the page in a valid HTML5 document with the title and page styles", () => {
    const html = buildHtml(basePage());

    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("<title>Test page</title>");

    // Page-level styles end up on the outer <main>.
    expect(html).toContain("background-color:#ffffff");
    expect(html).toContain("padding-left:16px");
    expect(html).toContain("padding-right:16px");
    expect(html).toContain("padding-top:24px");
    expect(html).toContain("padding-bottom:24px");
    expect(html).toContain("min-height:100vh");

    // Responsive single-column collapse for small screens.
    expect(html).toContain("@media (max-width: 640px)");
    expect(html).toContain("grid-template-columns: 1fr !important");
  });

  it("escapes user-supplied text and attributes", () => {
    const page = basePage([
      {
        id: "r1",
        backgroundColor: "transparent",
        paddingX: 0,
        paddingY: 0,
        marginY: 0,
        columnsCount: 1,
        columnWidths: [1],
        columnGap: 0,
        columns: [
          [
            {
              id: "h1",
              type: "heading",
              text: "Hello <script>alert('x')</script> & friends",
              level: 1,
              color: "#000",
              fontSize: 24,
              fontWeight: 400,
              fontFamily: "serif",
              align: "left",
              letterSpacing: 0,
            },
          ],
        ],
      },
    ]);
    const html = buildHtml(page);

    expect(html).toContain(
      "Hello &lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; friends"
    );
    expect(html).not.toContain("<script>alert");
  });

  it("renders every supported element type", () => {
    const page = basePage([
      {
        id: "r1",
        backgroundColor: "#fafafa",
        paddingX: 32,
        paddingY: 48,
        marginY: 8,
        columnsCount: 2,
        columnWidths: [2, 1],
        columnGap: 24,
        columns: [
          [
            {
              id: "h1",
              type: "heading",
              text: "Hello",
              level: 2,
              color: "#111",
              fontSize: 40,
              fontWeight: 700,
              fontFamily: "serif",
              align: "left",
              letterSpacing: -1,
            },
            {
              id: "p1",
              type: "paragraph",
              text: "World",
              color: "#222",
              fontSize: 16,
              fontWeight: 400,
              fontFamily: "sans-serif",
              align: "left",
              lineHeight: 1.5,
            },
            {
              id: "q1",
              type: "quote",
              text: "Be kind.",
              author: "Anon",
              color: "#333",
              fontSize: 24,
              fontFamily: "serif",
              align: "center",
            },
            {
              id: "b1",
              type: "button",
              label: "Click",
              href: "https://example.com",
              backgroundColor: "#000",
              textColor: "#fff",
              paddingX: 24,
              paddingY: 12,
              radius: 4,
              fontSize: 14,
              align: "center",
              letterSpacing: 1,
            },
            {
              id: "i1",
              type: "image",
              src: "https://img.example/cat.jpg",
              alt: "A cat",
              widthPct: 80,
              align: "center",
              radius: 8,
            },
            {
              id: "d1",
              type: "divider",
              color: "#ccc",
              thickness: 2,
              widthPct: 50,
            },
            {
              id: "s1",
              type: "spacer",
              height: 40,
            },
            {
              id: "v1",
              type: "video",
              url: "https://www.youtube.com/embed/abc",
              widthPct: 100,
            },
            {
              id: "so1",
              type: "social",
              color: "#000",
              size: 24,
              align: "center",
              gap: 12,
              links: [
                { platform: "instagram", url: "https://instagram.com/x" },
                { platform: "email", url: "mailto:hi@example.com" },
              ],
            },
          ],
          [],
        ],
      },
    ]);
    const html = buildHtml(page);

    // Row + grid scaffolding (fractions are normalised to a percentage of the
    // total weight; JS division leaves a long tail of repeating digits).
    expect(html).toMatch(/grid-template-columns:66\.6+\d?fr 33\.3+\d?fr/);
    expect(html).toContain("gap:24px");
    expect(html).toContain("background-color:#fafafa");
    expect(html).toContain("margin-top:8px");

    // Heading.
    expect(html).toMatch(/<h2 style="[^"]*font-size:40px[^"]*">Hello<\/h2>/);

    // Paragraph.
    expect(html).toMatch(/<p style="[^"]*line-height:1\.5[^"]*">World<\/p>/);

    // Quote with author cite.
    expect(html).toMatch(/<blockquote[^>]*><div>Be kind\.<\/div><cite/);
    expect(html).toContain("Anon</cite>");

    // Button. Non-transparent background → no border.
    expect(html).toMatch(
      /<a href="https:\/\/example\.com" style="[^"]*background-color:#000[^"]*border:none[^"]*">Click<\/a>/
    );

    // Image.
    expect(html).toMatch(
      /<img src="https:\/\/img\.example\/cat\.jpg" alt="A cat" style="[^"]*width:80%[^"]*border-radius:8px[^"]*"/
    );

    // Divider with non-full width has lateral margins.
    expect(html).toMatch(/<hr style="[^"]*height:2px[^"]*width:50%/);
    expect(html).toContain("margin:0 25%");

    // Spacer.
    expect(html).toContain(
      '<div aria-hidden="true" style="height:40px;width:100%"></div>'
    );

    // Video.
    expect(html).toContain('src="https://www.youtube.com/embed/abc"');
    expect(html).toContain("padding-bottom:56.25%");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain(
      'sandbox="allow-scripts allow-same-origin allow-presentation"'
    );

    // Social — IG icon + email icon.
    expect(html).toContain(
      'href="https://instagram.com/x" aria-label="Instagram"'
    );
    expect(html).toContain(">IG</a>");
    expect(html).toContain('href="mailto:hi@example.com" aria-label="Email"');
    expect(html).toContain(">@</a>");
  });

  it("draws a transparent button with a coloured border", () => {
    const page = basePage([
      {
        id: "r",
        backgroundColor: "transparent",
        paddingX: 0,
        paddingY: 0,
        marginY: 0,
        columnsCount: 1,
        columnWidths: [1],
        columnGap: 0,
        columns: [
          [
            {
              id: "b",
              type: "button",
              label: "Ghost",
              href: "#",
              backgroundColor: "transparent",
              textColor: "#f0f",
              paddingX: 16,
              paddingY: 8,
              radius: 0,
              fontSize: 14,
              align: "left",
              letterSpacing: 0,
            },
          ],
        ],
      },
    ]);

    const html = buildHtml(page);
    expect(html).toContain("border:1px solid #f0f");
  });

  it("falls back to 'Untitled page' if no title is set", () => {
    const html = buildHtml({ ...basePage(), title: "" });
    expect(html).toContain("<title>Untitled page</title>");
  });

  it("replaces unsafe exported URLs with inert fallbacks", () => {
    const html = buildHtml(
      basePage([
        {
          id: "r",
          backgroundColor: "transparent",
          paddingX: 0,
          paddingY: 0,
          marginY: 0,
          columnsCount: 1,
          columnWidths: [1],
          columnGap: 0,
          columns: [
            [
              {
                id: "b",
                type: "button",
                label: "Click",
                href: "javascript:alert(1)",
                backgroundColor: "#000",
                textColor: "#fff",
                paddingX: 16,
                paddingY: 8,
                radius: 0,
                fontSize: 14,
                align: "left",
                letterSpacing: 0,
              },
              {
                id: "i",
                type: "image",
                src: "data:text/html,<script>alert(1)</script>",
                alt: "Unsafe",
                widthPct: 100,
                align: "left",
                radius: 0,
              },
              {
                id: "v",
                type: "video",
                url: "https://example.com/embed",
                widthPct: 100,
              },
              {
                id: "s",
                type: "social",
                color: "#000",
                size: 24,
                align: "left",
                gap: 8,
                links: [{ platform: "website", url: "javascript:alert(1)" }],
              },
            ],
          ],
        },
      ])
    );

    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:text/html");
    expect(html).toMatch(/<a href="#" style="[^"]*">Click<\/a>/);
    expect(html).toContain('<img src="" alt="Unsafe"');
    expect(html).toContain('<iframe src="about:blank"');
    expect(html).toContain('href="#" aria-label="Website"');
  });

  it("replaces relative and protocol-relative exported URLs with inert fallbacks", () => {
    const html = buildHtml(
      basePage([
        {
          id: "r",
          backgroundColor: "transparent",
          paddingX: 0,
          paddingY: 0,
          marginY: 0,
          columnsCount: 1,
          columnWidths: [1],
          columnGap: 0,
          columns: [
            [
              {
                id: "b",
                type: "button",
                label: "Relative",
                href: "/foo",
                backgroundColor: "#000",
                textColor: "#fff",
                paddingX: 16,
                paddingY: 8,
                radius: 0,
                fontSize: 14,
                align: "left",
                letterSpacing: 0,
              },
              {
                id: "i",
                type: "image",
                src: "//cdn.example/foo.jpg",
                alt: "Protocol relative",
                widthPct: 100,
                align: "left",
                radius: 0,
              },
              {
                id: "v",
                type: "video",
                url: "https:foo",
                widthPct: 100,
              },
            ],
          ],
        },
      ])
    );

    expect(html).not.toContain("/foo");
    expect(html).not.toContain("//cdn.example/foo.jpg");
    expect(html).not.toContain("https:foo");
    expect(html).toMatch(/<a href="#" style="[^"]*">Relative<\/a>/);
    expect(html).toContain('<img src="" alt="Protocol relative"');
    expect(html).toContain('<iframe src="about:blank"');
  });
});
