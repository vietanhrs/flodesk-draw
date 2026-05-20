import { afterEach, describe, expect, it, vi } from "vitest";

import { createButton } from "@src/pages/Editor/elements/button/create";
import { createImage } from "@src/pages/Editor/elements/image/create";
import { createSocial } from "@src/pages/Editor/elements/social/create";
import { createVideo } from "@src/pages/Editor/elements/video/create";
import {
  openFlodeskFile,
  parseFlodeskFile,
  saveFlodeskFile,
} from "@src/pages/Editor/exporter/flodeskFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";
import type { PageData } from "@src/pages/Editor/state/types";

const draftWith = (page: unknown) =>
  JSON.stringify({
    version: 1,
    page,
  });

const pageWithElement = (
  element: PageData["rows"][number]["columns"][number][number]
) => {
  const page = createEmptyPage();
  page.rows[0] = {
    ...page.rows[0],
    columns: [[element]],
  };
  return page;
};

describe("flodeskFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "showOpenFilePicker");
    Reflect.deleteProperty(window, "showSaveFilePicker");
  });

  it("parses a structurally valid .flodesk draft", () => {
    const page = createEmptyPage();

    expect(parseFlodeskFile(draftWith(page))).toEqual(page);
  });

  it("rejects non-JSON content", () => {
    expect(() => parseFlodeskFile("not json")).toThrow(
      "File is not valid JSON."
    );
  });

  it("rejects unsupported file versions", () => {
    expect(() =>
      parseFlodeskFile(
        JSON.stringify({ version: 999, page: createEmptyPage() })
      )
    ).toThrow("Unsupported Flodesk file version: 999.");
  });

  it("rejects missing page structure before the editor mounts", () => {
    const { title, backgroundColor, paddingX, paddingY } = createEmptyPage();

    expect(() =>
      parseFlodeskFile(
        draftWith({ title, backgroundColor, paddingX, paddingY })
      )
    ).toThrow(/page\.rows must be an array/);
  });

  it("rejects row/column shape mismatches", () => {
    const page = createEmptyPage();
    page.rows[0] = {
      ...page.rows[0],
      columnsCount: 2,
      columnWidths: [1],
      columns: [page.rows[0].columns[0]],
    };

    expect(() => parseFlodeskFile(draftWith(page))).toThrow(
      /page\.rows\[0\]\.columnWidths must be an array with 2 entries/
    );
  });

  it("rejects unknown element types", () => {
    const page = createEmptyPage();
    page.rows[0].columns[0][0] = {
      id: "el-unknown",
      type: "unknown",
    } as never;

    expect(() => parseFlodeskFile(draftWith(page))).toThrow(
      /page\.rows\[0\]\.columns\[0\]\[0\]\.type must be a supported element type/
    );
  });

  it("rejects files over the parser size limit before JSON parsing", () => {
    expect(() => parseFlodeskFile("x".repeat(1_000_001))).toThrow(
      "Flodesk file is too large."
    );
  });

  it("rejects unsafe URL protocols in loaded drafts", () => {
    const buttonPage = pageWithElement({
      ...createButton(),
      href: "javascript:alert(1)",
    });
    const imagePage = pageWithElement({
      ...createImage(),
      src: "data:text/html,<script>alert(1)</script>",
    });
    const videoPage = pageWithElement({
      ...createVideo(),
      url: "http://example.com/embed",
    });
    const socialPage = pageWithElement({
      ...createSocial(),
      links: [{ platform: "website", url: "javascript:alert(1)" }],
    });

    expect(() => parseFlodeskFile(draftWith(buttonPage))).toThrow(
      /href must be an http, https, mailto, or tel URL/
    );
    expect(() => parseFlodeskFile(draftWith(imagePage))).toThrow(
      /src must be an http or https image URL/
    );
    expect(() => parseFlodeskFile(draftWith(videoPage))).toThrow(
      /url must be an https video URL/
    );
    expect(() => parseFlodeskFile(draftWith(socialPage))).toThrow(
      /links\[0\]\.url must be an http, https, mailto, or tel URL/
    );
  });

  it("rejects relative and protocol-relative URLs in loaded drafts", () => {
    const relativeLinkPage = pageWithElement({
      ...createButton(),
      href: "/foo",
    });
    const protocolRelativeImagePage = pageWithElement({
      ...createImage(),
      src: "//cdn.example/foo.jpg",
    });
    const schemeRelativeVideoPage = pageWithElement({
      ...createVideo(),
      url: "https:foo",
    });

    expect(() => parseFlodeskFile(draftWith(relativeLinkPage))).toThrow(
      /href must be an http, https, mailto, or tel URL/
    );
    expect(() =>
      parseFlodeskFile(draftWith(protocolRelativeImagePage))
    ).toThrow(/src must be an http or https image URL/);
    expect(() => parseFlodeskFile(draftWith(schemeRelativeVideoPage))).toThrow(
      /url must be an https video URL/
    );
  });

  it("rejects values outside the editor's parser bounds", () => {
    const page = createEmptyPage();
    page.paddingX = 999;

    expect(() => parseFlodeskFile(draftWith(page))).toThrow(
      /page\.paddingX must be a number between 0 and 200/
    );
  });

  it("rejects drafts with too many rows", () => {
    const page = createEmptyPage();
    page.rows = Array.from({ length: 101 }, (_, index) => ({
      ...page.rows[0],
      id: `row-${index}`,
    }));

    expect(() => parseFlodeskFile(draftWith(page))).toThrow(
      /page\.rows must be an array with at most 100 entries/
    );
  });

  it("writes back to an opened File System Access handle without prompting", async () => {
    const page = createEmptyPage();
    let written = "";
    const writable = {
      write: vi.fn(async (data: string | Blob) => {
        written = typeof data === "string" ? data : await data.text();
      }),
      close: vi.fn(() => Promise.resolve()),
    };
    const handle = {
      createWritable: vi.fn(() => Promise.resolve(writable)),
      getFile: vi.fn(() =>
        Promise.resolve(
          new File([""], "opened-draft.flodesk", { type: "text/json" })
        )
      ),
    } as unknown as FileSystemFileHandle;
    const picker = vi.fn();
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      writable: true,
      value: picker,
    });

    const result = await saveFlodeskFile(page, handle, "ignored-name");

    expect(picker).not.toHaveBeenCalled();
    expect(writable.write).toHaveBeenCalledTimes(1);
    expect(writable.close).toHaveBeenCalledTimes(1);
    expect(JSON.parse(written)).toEqual({ version: 1, page });
    expect(result).toEqual({ name: "opened-draft", handle });
  });

  it("opens a .flodesk draft through the File System Access picker", async () => {
    const page = createEmptyPage();
    const file = new File([draftWith(page)], "opened-draft.flodesk", {
      type: "application/json",
    });
    const handle = {
      getFile: vi.fn(() => Promise.resolve(file)),
    } as unknown as FileSystemFileHandle;
    const picker = vi.fn(() => Promise.resolve([handle]));
    Object.defineProperty(window, "showOpenFilePicker", {
      configurable: true,
      writable: true,
      value: picker,
    });

    const result = await openFlodeskFile();

    const [pickerOptions] = picker.mock.calls[0] as [
      { multiple: boolean; types: unknown[] },
    ];
    expect(pickerOptions.multiple).toBe(false);
    expect(Array.isArray(pickerOptions.types)).toBe(true);
    expect(result).toEqual({ name: "opened-draft", page, handle });
  });

  it("returns null when the open picker is cancelled", async () => {
    const picker = vi.fn(() =>
      Promise.reject(
        Object.assign(new Error("cancelled"), { name: "AbortError" })
      )
    );
    Object.defineProperty(window, "showOpenFilePicker", {
      configurable: true,
      writable: true,
      value: picker,
    });

    await expect(openFlodeskFile()).resolves.toBeNull();
  });

  it("returns null when the save picker is cancelled", async () => {
    const picker = vi.fn(() =>
      Promise.reject(
        Object.assign(new Error("cancelled"), { name: "AbortError" })
      )
    );
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      writable: true,
      value: picker,
    });

    await expect(
      saveFlodeskFile(createEmptyPage(), undefined, "cancelled-draft")
    ).resolves.toBeNull();
  });
});
