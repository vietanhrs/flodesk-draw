import type { PageData } from "@src/pages/Editor/state/types";

import { buildHtml } from "./buildHtml";

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "page";

interface FileSystemFileHandleLike {
  createWritable: () => Promise<{
    write: (data: string | Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

interface ShowSaveFilePicker {
  (options: {
    suggestedName: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }): Promise<FileSystemFileHandleLike>;
}

export interface HtmlExportResult {
  ok: boolean;
  reason?: "cancelled" | "picker-write-failed" | "download-fallback";
}

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

const getSaveFilePicker = (): ShowSaveFilePicker | undefined =>
  (window as unknown as { showSaveFilePicker?: ShowSaveFilePicker })
    .showSaveFilePicker;

const fallbackDownload = (filename: string, html: string) => {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

export const exportPageAsHtml = async (
  page: PageData,
  filenameHint?: string
): Promise<HtmlExportResult> => {
  const html = buildHtml(page);
  const suggested = `${slugify(filenameHint ?? page.title)}.html`;
  const picker = getSaveFilePicker();

  if (typeof picker !== "function") {
    fallbackDownload(suggested, html);
    return { ok: true, reason: "download-fallback" };
  }

  let handle: FileSystemFileHandleLike;
  try {
    handle = await picker({
      suggestedName: suggested,
      types: [
        {
          description: "HTML page",
          accept: { "text/html": [".html"] },
        },
      ],
    });
  } catch (error) {
    if (isAbortError(error)) return { ok: false, reason: "cancelled" };
    throw error;
  }

  try {
    const writable = await handle.createWritable();
    await writable.write(html);
    await writable.close();
    return { ok: true };
  } catch (error) {
    console.error("Falling back to download after picker write failure", error);
    fallbackDownload(suggested, html);
    return { ok: true, reason: "picker-write-failed" };
  }
};
