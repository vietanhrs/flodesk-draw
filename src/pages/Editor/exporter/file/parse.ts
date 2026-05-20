import type { PageData } from "@src/pages/Editor/state/types";

import { FLODESK_EXTENSION, FLODESK_FILE_VERSION } from "./constants";
import { validatePage } from "./pageValidation";
import type { FlodeskFile } from "./types";
import { assertFileSize } from "./validationPrimitives";

export const stripExtension = (name: string): string =>
  name.toLowerCase().endsWith(FLODESK_EXTENSION)
    ? name.slice(0, -FLODESK_EXTENSION.length)
    : name;

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

export const serializeFlodeskFile = (page: PageData): string =>
  JSON.stringify({ version: FLODESK_FILE_VERSION, page } satisfies FlodeskFile);
