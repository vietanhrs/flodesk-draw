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
): Promise<boolean> => {
  const html = buildHtml(page);
  const suggested = `${slugify(filenameHint ?? page.title)}.html`;

  const picker = (
    window as unknown as { showSaveFilePicker?: ShowSaveFilePicker }
  ).showSaveFilePicker;

  if (typeof picker === "function") {
    try {
      const handle = await picker({
        suggestedName: suggested,
        types: [
          {
            description: "HTML page",
            accept: { "text/html": [".html"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(html);
      await writable.close();
      return true;
    } catch (err) {
      if ((err as Error).name === "AbortError") return false;
      fallbackDownload(suggested, html);
      return true;
    }
  }

  fallbackDownload(suggested, html);
  return true;
};
