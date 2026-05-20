import {
  fontFamilyOptions,
  weightOptions,
} from "@src/pages/Editor/elements/shared/fontOptions";
import {
  isSafeImageUrl,
  isSafeLinkUrl,
  isSafeVideoUrl,
} from "@src/pages/Editor/elements/shared/urls";
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

const MAX_FLODESK_FILE_BYTES = 1_000_000;
const MAX_ROWS = 100;
const MAX_ELEMENTS = 1_000;
const MAX_ELEMENTS_PER_COLUMN = 100;
const MAX_SOCIAL_LINKS = 12;
const MAX_ID_LENGTH = 128;
const MAX_TYPE_LENGTH = 32;
const MAX_TITLE_LENGTH = 200;
const MAX_TEXT_LENGTH = 10_000;
const MAX_SHORT_TEXT_LENGTH = 1_000;
const MAX_URL_LENGTH = 2_048;
const MAX_COLOR_LENGTH = 64;
const MAX_FONT_FAMILY_LENGTH = 128;
const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const TRANSPARENT_VALUES = ["transparent", "rgba(0,0,0,0)"] as const;
const FONT_FAMILIES = fontFamilyOptions.map((option) => option.value);
const FONT_WEIGHTS = weightOptions.map((option) => option.value);

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

const failTooLarge = (): never => {
  throw new Error(
    `Flodesk file is too large. Maximum size is ${MAX_FLODESK_FILE_BYTES} bytes.`
  );
};

const assertFileSize = (size: number) => {
  if (size > MAX_FLODESK_FILE_BYTES) failTooLarge();
};

const requireString = (
  value: unknown,
  path: string,
  maxLength = MAX_TEXT_LENGTH
): string => {
  if (!isString(value)) return failInvalidPage(path, "a string");
  if (value.length > maxLength) {
    failInvalidPage(path, `a string no longer than ${maxLength} characters`);
  }
  return value;
};

const requireNumber = (value: unknown, path: string): number => {
  if (!isFiniteNumber(value)) return failInvalidPage(path, "a finite number");
  return value;
};

const requireNumberInRange = (
  value: unknown,
  path: string,
  min: number,
  max: number
): number => {
  const number = requireNumber(value, path);
  if (number < min || number > max) {
    failInvalidPage(path, `a number between ${min} and ${max}`);
  }
  return number;
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

const requireArray = (
  value: unknown,
  path: string,
  maxLength: number
): unknown[] => {
  if (!isUnknownArray(value)) return failInvalidPage(path, "an array");
  if (value.length > maxLength) {
    failInvalidPage(path, `an array with at most ${maxLength} entries`);
  }
  return value;
};

const requireColor = (
  value: unknown,
  path: string,
  { allowTransparent = false }: { allowTransparent?: boolean } = {}
) => {
  const color = requireString(value, path, MAX_COLOR_LENGTH);
  if (
    allowTransparent &&
    TRANSPARENT_VALUES.some((transparent) => transparent === color)
  ) {
    return;
  }
  if (!COLOR_RE.test(color)) {
    failInvalidPage(
      path,
      allowTransparent ? "a hex color or transparent" : "a hex color"
    );
  }
};

const requireFontFamily = (value: unknown, path: string) => {
  const family = requireString(value, path, MAX_FONT_FAMILY_LENGTH);
  requireOneOf(family, FONT_FAMILIES, path);
};

const requireUrl = (
  value: unknown,
  path: string,
  isSafeUrl: (url: string) => boolean,
  expected: string
) => {
  const url = requireString(value, path, MAX_URL_LENGTH);
  if (url.trim() && !isSafeUrl(url)) failInvalidPage(path, expected);
};

const requireColumnsCount = (value: unknown, path: string): 1 | 2 | 3 | 4 => {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return failInvalidPage(path, "1, 2, 3, or 4");
};

const requireCommonElementFields = (
  element: Record<string, unknown>,
  path: string
) => {
  requireString(element.id, `${path}.id`, MAX_ID_LENGTH);
  requireString(element.type, `${path}.type`, MAX_TYPE_LENGTH);
};

const validateElement = (value: unknown, path: string) => {
  if (!isRecord(value)) return failInvalidPage(path, "an object");
  const element = value;
  requireCommonElementFields(element, path);

  switch (element.type) {
    case "heading":
      requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
      requireOneOf(element.level, [1, 2, 3] as const, `${path}.level`);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 10, 200);
      requireOneOf(element.fontWeight, FONT_WEIGHTS, `${path}.fontWeight`);
      requireFontFamily(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(
        element.letterSpacing,
        `${path}.letterSpacing`,
        -10,
        20
      );
      return;
    case "paragraph":
      requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 8, 64);
      requireOneOf(element.fontWeight, FONT_WEIGHTS, `${path}.fontWeight`);
      requireFontFamily(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(element.lineHeight, `${path}.lineHeight`, 1, 3);
      return;
    case "quote":
      requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
      requireString(element.author, `${path}.author`, MAX_SHORT_TEXT_LENGTH);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 14, 80);
      requireFontFamily(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      return;
    case "image":
      requireUrl(
        element.src,
        `${path}.src`,
        isSafeImageUrl,
        "an http or https image URL"
      );
      requireString(element.alt, `${path}.alt`, MAX_SHORT_TEXT_LENGTH);
      requireNumberInRange(element.widthPct, `${path}.widthPct`, 10, 100);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(element.radius, `${path}.radius`, 0, 50);
      return;
    case "video":
      requireUrl(
        element.url,
        `${path}.url`,
        isSafeVideoUrl,
        "an https video URL"
      );
      requireNumberInRange(element.widthPct, `${path}.widthPct`, 20, 100);
      return;
    case "button":
      requireString(element.label, `${path}.label`, MAX_SHORT_TEXT_LENGTH);
      requireUrl(
        element.href,
        `${path}.href`,
        isSafeLinkUrl,
        "an http, https, mailto, or tel URL"
      );
      requireColor(element.backgroundColor, `${path}.backgroundColor`, {
        allowTransparent: true,
      });
      requireColor(element.textColor, `${path}.textColor`);
      requireNumberInRange(element.paddingX, `${path}.paddingX`, 0, 80);
      requireNumberInRange(element.paddingY, `${path}.paddingY`, 0, 60);
      requireNumberInRange(element.radius, `${path}.radius`, 0, 50);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 10, 32);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(
        element.letterSpacing,
        `${path}.letterSpacing`,
        0,
        10
      );
      return;
    case "divider":
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.thickness, `${path}.thickness`, 1, 20);
      requireNumberInRange(element.widthPct, `${path}.widthPct`, 5, 100);
      return;
    case "spacer":
      requireNumberInRange(element.height, `${path}.height`, 0, 400);
      return;
    case "social": {
      const links = requireArray(
        element.links,
        `${path}.links`,
        MAX_SOCIAL_LINKS
      );
      links.forEach((link, linkIndex) => {
        const linkPath = `${path}.links[${linkIndex}]`;
        if (!isRecord(link)) return failInvalidPage(linkPath, "an object");
        requireOneOf(
          link.platform,
          ["instagram", "twitter", "facebook", "youtube", "email", "website"],
          `${linkPath}.platform`
        );
        requireUrl(
          link.url,
          `${linkPath}.url`,
          isSafeLinkUrl,
          "an http, https, mailto, or tel URL"
        );
      });
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.size, `${path}.size`, 12, 48);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(element.gap, `${path}.gap`, 0, 48);
      return;
    }
    default:
      return failInvalidPage(`${path}.type`, "a supported element type");
  }
};

const validatePage = (value: unknown): PageData => {
  if (!isRecord(value)) return failInvalidPage("page", "an object");
  const page = value;
  requireString(page.title, "page.title", MAX_TITLE_LENGTH);
  requireColor(page.backgroundColor, "page.backgroundColor", {
    allowTransparent: true,
  });
  requireNumberInRange(page.paddingX, "page.paddingX", 0, 200);
  requireNumberInRange(page.paddingY, "page.paddingY", 0, 200);
  const rows = requireArray(page.rows, "page.rows", MAX_ROWS);
  let totalElements = 0;

  rows.forEach((rowValue, rowIndex) => {
    const rowPath = `page.rows[${rowIndex}]`;
    if (!isRecord(rowValue)) return failInvalidPage(rowPath, "an object");
    const row = rowValue;
    requireString(row.id, `${rowPath}.id`, MAX_ID_LENGTH);
    requireColor(row.backgroundColor, `${rowPath}.backgroundColor`, {
      allowTransparent: true,
    });
    requireNumberInRange(row.paddingX, `${rowPath}.paddingX`, 0, 200);
    requireNumberInRange(row.paddingY, `${rowPath}.paddingY`, 0, 200);
    requireNumberInRange(row.marginY, `${rowPath}.marginY`, 0, 200);
    const columnsCount = requireColumnsCount(
      row.columnsCount,
      `${rowPath}.columnsCount`
    );
    requireNumberInRange(row.columnGap, `${rowPath}.columnGap`, 0, 200);
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
      requireNumberInRange(
        width,
        `${rowPath}.columnWidths[${widthIndex}]`,
        0.1,
        10
      )
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
      if (column.length > MAX_ELEMENTS_PER_COLUMN) {
        failInvalidPage(
          columnPath,
          `an array with at most ${MAX_ELEMENTS_PER_COLUMN} entries`
        );
      }
      totalElements += column.length;
      if (totalElements > MAX_ELEMENTS) {
        failInvalidPage("page.rows", `at most ${MAX_ELEMENTS} total elements`);
      }
      column.forEach((element, elementIndex) =>
        validateElement(element, `${columnPath}[${elementIndex}]`)
      );
    });
  });

  return page as unknown as PageData;
};

export const parseFlodeskFile = (raw: string): PageData => {
  assertFileSize(raw.length);
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
      try {
        assertFileSize(file.size);
      } catch (err) {
        input.remove();
        settled = true;
        reject(err instanceof Error ? err : new Error(String(err)));
        return;
      }
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
    assertFileSize(file.size);
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
