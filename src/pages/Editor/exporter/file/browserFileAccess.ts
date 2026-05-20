import type { PageData } from "@src/pages/Editor/state/types";

import { FLODESK_EXTENSION, FLODESK_MIME, flodeskTypes } from "./constants";
import {
  parseFlodeskFile,
  serializeFlodeskFile,
  stripExtension,
} from "./parse";
import type {
  LoadedFile,
  SaveResult,
  ShowOpenFilePicker,
  ShowSaveFilePicker,
} from "./types";
import { assertFileSize } from "./validationPrimitives";

const fsWindow = () =>
  window as unknown as {
    showOpenFilePicker?: ShowOpenFilePicker;
    showSaveFilePicker?: ShowSaveFilePicker;
  };

const toError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(String(err));

const fallbackOpen = (): Promise<LoadedFile | null> =>
  new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = FLODESK_EXTENSION;
    input.style.display = "none";
    let settled = false;
    const finish = (result: LoadedFile | null) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(result);
    };
    const fail = (err: unknown) => {
      if (settled) return;
      input.remove();
      settled = true;
      reject(toError(err));
    };

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      try {
        assertFileSize(file.size);
      } catch (err) {
        fail(err);
        return;
      }
      file
        .text()
        .then((text) =>
          finish({
            name: stripExtension(file.name),
            page: parseFlodeskFile(text),
          })
        )
        .catch(fail);
    };
    // If the user dismisses the picker, browsers don't always fire `change`.
    // A `cancel` event fires in modern browsers; older ones leave the promise
    // pending until GC, which is acceptable for our one-shot helper.
    input.addEventListener("cancel", () => finish(null));
    document.body.appendChild(input);
    input.click();
  });

const fallbackDownload = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: FLODESK_MIME });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
};

export const openFlodeskFile = async (): Promise<LoadedFile | null> => {
  const picker = fsWindow().showOpenFilePicker;
  if (typeof picker === "function") {
    let handle: FileSystemFileHandle;
    try {
      [handle] = await picker({ multiple: false, types: flodeskTypes });
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      throw err;
    }
    const file = await handle.getFile();
    assertFileSize(file.size);
    const page = parseFlodeskFile(await file.text());
    return { name: stripExtension(file.name), page, handle };
  }
  return fallbackOpen();
};

export const saveFlodeskFile = async (
  page: PageData,
  currentHandle?: FileSystemFileHandle,
  suggestedName?: string
): Promise<SaveResult | null> => {
  const contents = serializeFlodeskFile(page);

  if (currentHandle) {
    const writable = await currentHandle.createWritable();
    await writable.write(contents);
    await writable.close();
    const file = await currentHandle.getFile();
    return { name: stripExtension(file.name), handle: currentHandle };
  }

  const fallbackName =
    suggestedName && suggestedName.length > 0 ? suggestedName : "untitled";
  const suggested = `${stripExtension(fallbackName)}${FLODESK_EXTENSION}`;

  const picker = fsWindow().showSaveFilePicker;
  if (typeof picker === "function") {
    let handle: FileSystemFileHandle;
    try {
      handle = await picker({ suggestedName: suggested, types: flodeskTypes });
    } catch (err) {
      if ((err as Error).name === "AbortError") return null;
      throw err;
    }
    const writable = await handle.createWritable();
    await writable.write(contents);
    await writable.close();
    const file = await handle.getFile();
    return { name: stripExtension(file.name), handle };
  }

  fallbackDownload(suggested, contents);
  return { name: stripExtension(suggested) };
};
