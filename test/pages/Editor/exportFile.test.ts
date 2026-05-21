import { afterEach, describe, expect, it, vi } from "vitest";

import { exportPageAsHtml } from "@src/pages/Editor/exporter/exportFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";

describe("exportPageAsHtml", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "showSaveFilePicker");
  });

  it("returns a download fallback result when the picker API is unavailable", async () => {
    vi.useFakeTimers();
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:html-export");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    const result = await exportPageAsHtml(createEmptyPage(), "Landing Page");

    expect(result).toEqual({ ok: true, reason: "download-fallback" });
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:html-export");
    vi.useRealTimers();
  });

  it("returns cancelled when the save picker is dismissed", async () => {
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      writable: true,
      value: vi.fn(() =>
        Promise.reject(
          Object.assign(new Error("cancelled"), { name: "AbortError" })
        )
      ),
    });

    await expect(
      exportPageAsHtml(createEmptyPage(), "Landing Page")
    ).resolves.toEqual({
      ok: false,
      reason: "cancelled",
    });
  });

  it("falls back to a download when picker writing fails after selection", async () => {
    vi.useFakeTimers();
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:picker-fallback");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      writable: true,
      value: vi.fn(() =>
        Promise.resolve({
          createWritable: () =>
            Promise.resolve({
              write: () => Promise.reject(new Error("disk full")),
              close: () => Promise.resolve(),
            }),
        })
      ),
    });

    const result = await exportPageAsHtml(createEmptyPage(), "Launch Plan");

    expect(result).toEqual({ ok: true, reason: "picker-write-failed" });
    expect(consoleError).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchorClick).toHaveBeenCalledTimes(1);

    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:picker-fallback");
    vi.useRealTimers();
  });
});
