import { afterEach, describe, expect, it, vi } from "vitest";

import {
  parseFlodeskFile,
  saveFlodeskFile,
} from "@src/pages/Editor/exporter/flodeskFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";

const draftWith = (page: unknown) =>
  JSON.stringify({
    version: 1,
    page,
  });

describe("flodeskFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
});
