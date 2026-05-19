import type { PageData } from "@src/pages/Editor/state/types";

export const FLODESK_FILE_VERSION = 1;
export const FLODESK_EXTENSION = ".flodesk";
export const FLODESK_MIME = "application/json";

export interface FlodeskFile {
  version: typeof FLODESK_FILE_VERSION;
  page: PageData;
}

export interface LoadedFile {
  /** File name without the .flodesk extension. */
  name: string;
  page: PageData;
  /** Present when the FS Access API was used; lets us re-save without prompting. */
  handle?: FileSystemFileHandle;
}

interface FilePickerType {
  description: string;
  accept: Record<string, string[]>;
}

interface FilePickerOptions {
  suggestedName?: string;
  types?: FilePickerType[];
}

interface ShowOpenFilePicker {
  (
    options: FilePickerOptions & { multiple?: false }
  ): Promise<FileSystemFileHandle[]>;
}

interface ShowSaveFilePicker {
  (options: FilePickerOptions): Promise<FileSystemFileHandle>;
}

const fsWindow = () =>
  window as unknown as {
    showOpenFilePicker?: ShowOpenFilePicker;
    showSaveFilePicker?: ShowSaveFilePicker;
  };

const flodeskTypes: FilePickerType[] = [
  {
    description: "Flodesk draft",
    accept: { [FLODESK_MIME]: [FLODESK_EXTENSION] },
  },
];

const stripExtension = (name: string): string =>
  name.toLowerCase().endsWith(FLODESK_EXTENSION)
    ? name.slice(0, -FLODESK_EXTENSION.length)
    : name;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isUnknownArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isTextAlign = (value: unknown): value is "left" | "center" | "right" =>
  value === "left" || value === "center" || value === "right";

const failInvalidPage = (path: string, expected: string): never => {
  throw new Error(
    `Flodesk file has invalid page data: ${path} must be ${expected}.`
  );
};

const requireString = (value: unknown, path: string) => {
  if (!isString(value)) failInvalidPage(path, "a string");
};

const requireNumber = (value: unknown, path: string) => {
  if (!isFiniteNumber(value)) failInvalidPage(path, "a finite number");
};

const requireTextAlign = (value: unknown, path: string) => {
  if (!isTextAlign(value)) failInvalidPage(path, "left, center, or right");
};

const requireOneOf = (
  value: unknown,
  allowed: readonly unknown[],
  path: string
) => {
  if (!allowed.includes(value)) {
    failInvalidPage(path, allowed.map(String).join(", "));
  }
};

const requireColumnsCount = (value: unknown, path: string): 1 | 2 | 3 | 4 => {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return failInvalidPage(path, "1, 2, 3, or 4");
};

const requireCommonElementFields = (
  element: Record<string, unknown>,
  path: string
) => {
  requireString(element.id, `${path}.id`);
  requireString(element.type, `${path}.type`);
};

const validateElement = (value: unknown, path: string) => {
  if (!isRecord(value)) return failInvalidPage(path, "an object");
  const element = value;
  requireCommonElementFields(element, path);

  switch (element.type) {
    case "heading":
      requireString(element.text, `${path}.text`);
      requireOneOf(element.level, [1, 2, 3] as const, `${path}.level`);
      requireString(element.color, `${path}.color`);
      requireNumber(element.fontSize, `${path}.fontSize`);
      requireNumber(element.fontWeight, `${path}.fontWeight`);
      requireString(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumber(element.letterSpacing, `${path}.letterSpacing`);
      return;
    case "paragraph":
      requireString(element.text, `${path}.text`);
      requireString(element.color, `${path}.color`);
      requireNumber(element.fontSize, `${path}.fontSize`);
      requireNumber(element.fontWeight, `${path}.fontWeight`);
      requireString(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumber(element.lineHeight, `${path}.lineHeight`);
      return;
    case "quote":
      requireString(element.text, `${path}.text`);
      requireString(element.author, `${path}.author`);
      requireString(element.color, `${path}.color`);
      requireNumber(element.fontSize, `${path}.fontSize`);
      requireString(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      return;
    case "image":
      requireString(element.src, `${path}.src`);
      requireString(element.alt, `${path}.alt`);
      requireNumber(element.widthPct, `${path}.widthPct`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumber(element.radius, `${path}.radius`);
      return;
    case "video":
      requireString(element.url, `${path}.url`);
      requireNumber(element.widthPct, `${path}.widthPct`);
      return;
    case "button":
      requireString(element.label, `${path}.label`);
      requireString(element.href, `${path}.href`);
      requireString(element.backgroundColor, `${path}.backgroundColor`);
      requireString(element.textColor, `${path}.textColor`);
      requireNumber(element.paddingX, `${path}.paddingX`);
      requireNumber(element.paddingY, `${path}.paddingY`);
      requireNumber(element.radius, `${path}.radius`);
      requireNumber(element.fontSize, `${path}.fontSize`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumber(element.letterSpacing, `${path}.letterSpacing`);
      return;
    case "divider":
      requireString(element.color, `${path}.color`);
      requireNumber(element.thickness, `${path}.thickness`);
      requireNumber(element.widthPct, `${path}.widthPct`);
      return;
    case "spacer":
      requireNumber(element.height, `${path}.height`);
      return;
    case "social": {
      const links = element.links;
      if (!isUnknownArray(links)) {
        return failInvalidPage(`${path}.links`, "an array");
      }
      links.forEach((link, linkIndex) => {
        const linkPath = `${path}.links[${linkIndex}]`;
        if (!isRecord(link)) return failInvalidPage(linkPath, "an object");
        requireOneOf(
          link.platform,
          ["instagram", "twitter", "facebook", "youtube", "email", "website"],
          `${linkPath}.platform`
        );
        requireString(link.url, `${linkPath}.url`);
      });
      requireString(element.color, `${path}.color`);
      requireNumber(element.size, `${path}.size`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumber(element.gap, `${path}.gap`);
      return;
    }
    default:
      return failInvalidPage(`${path}.type`, "a supported element type");
  }
};

const validatePage = (value: unknown): PageData => {
  if (!isRecord(value)) return failInvalidPage("page", "an object");
  const page = value;
  requireString(page.title, "page.title");
  requireString(page.backgroundColor, "page.backgroundColor");
  requireNumber(page.paddingX, "page.paddingX");
  requireNumber(page.paddingY, "page.paddingY");
  const rows = page.rows;
  if (!isUnknownArray(rows)) return failInvalidPage("page.rows", "an array");

  rows.forEach((rowValue, rowIndex) => {
    const rowPath = `page.rows[${rowIndex}]`;
    if (!isRecord(rowValue)) return failInvalidPage(rowPath, "an object");
    const row = rowValue;
    requireString(row.id, `${rowPath}.id`);
    requireString(row.backgroundColor, `${rowPath}.backgroundColor`);
    requireNumber(row.paddingX, `${rowPath}.paddingX`);
    requireNumber(row.paddingY, `${rowPath}.paddingY`);
    requireNumber(row.marginY, `${rowPath}.marginY`);
    const columnsCount = requireColumnsCount(
      row.columnsCount,
      `${rowPath}.columnsCount`
    );
    requireNumber(row.columnGap, `${rowPath}.columnGap`);
    const columnWidths = row.columnWidths;
    if (!isUnknownArray(columnWidths)) {
      return failInvalidPage(`${rowPath}.columnWidths`, "an array");
    }
    if (columnWidths.length !== columnsCount) {
      failInvalidPage(
        `${rowPath}.columnWidths`,
        `an array with ${String(columnsCount)} entries`
      );
    }
    columnWidths.forEach((width, widthIndex) =>
      requireNumber(width, `${rowPath}.columnWidths[${widthIndex}]`)
    );

    const columns = row.columns;
    if (!isUnknownArray(columns)) {
      return failInvalidPage(`${rowPath}.columns`, "an array");
    }
    if (columns.length !== columnsCount) {
      failInvalidPage(
        `${rowPath}.columns`,
        `an array with ${String(columnsCount)} entries`
      );
    }
    columns.forEach((column, columnIndex) => {
      const columnPath = `${rowPath}.columns[${columnIndex}]`;
      if (!isUnknownArray(column))
        return failInvalidPage(columnPath, "an array");
      column.forEach((element, elementIndex) =>
        validateElement(element, `${columnPath}[${elementIndex}]`)
      );
    });
  });

  return page as unknown as PageData;
};

export const parseFlodeskFile = (raw: string): PageData => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("File is not valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("File is not a Flodesk draft.");
  }
  const obj = parsed as Partial<FlodeskFile>;
  if (obj.version !== FLODESK_FILE_VERSION) {
    throw new Error(
      `Unsupported Flodesk file version: ${String(obj.version)}.`
    );
  }
  if (!obj.page) {
    throw new Error("Flodesk file is missing page data.");
  }
  return validatePage(obj.page);
};

const serialize = (page: PageData): string =>
  JSON.stringify({ version: FLODESK_FILE_VERSION, page } satisfies FlodeskFile);

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
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      file
        .text()
        .then((text) => {
          try {
            const page = parseFlodeskFile(text);
            finish({ name: stripExtension(file.name), page });
          } catch (err) {
            input.remove();
            settled = true;
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        })
        .catch((err: unknown) => {
          input.remove();
          settled = true;
          reject(err instanceof Error ? err : new Error(String(err)));
        });
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
    const page = parseFlodeskFile(await file.text());
    return { name: stripExtension(file.name), page, handle };
  }
  return fallbackOpen();
};

export interface SaveResult {
  name: string;
  handle?: FileSystemFileHandle;
}

/**
 * Save `page` to disk. When `currentHandle` is provided (the user opened the
 * page from a file in this session via the FS Access API), we write back to
 * the same handle silently. Otherwise we prompt the user for a destination.
 *
 * Returns the resulting filename + handle (handle only when FS Access is
 * available), or `null` if the user cancelled the save dialog.
 */
export const saveFlodeskFile = async (
  page: PageData,
  currentHandle?: FileSystemFileHandle,
  suggestedName?: string
): Promise<SaveResult | null> => {
  const contents = serialize(page);

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
