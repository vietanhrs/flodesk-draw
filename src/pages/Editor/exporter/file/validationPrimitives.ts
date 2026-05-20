import { failInvalidPage } from "@src/pages/Editor/elements/shared/validation";

import { MAX_FLODESK_FILE_BYTES } from "./constants";

export {
  failInvalidPage,
  FONT_WEIGHTS,
  isRecord,
  isUnknownArray,
  MAX_ID_LENGTH,
  MAX_SHORT_TEXT_LENGTH,
  MAX_SOCIAL_LINKS,
  MAX_TEXT_LENGTH,
  MAX_TYPE_LENGTH,
  MAX_URL_LENGTH,
  requireArray,
  requireColor,
  requireFontFamily,
  requireNumberInRange,
  requireOneOf,
  requireString,
  requireTextAlign,
  requireUrl,
} from "@src/pages/Editor/elements/shared/validation";

export const MAX_ROWS = 100;
export const MAX_ELEMENTS = 1_000;
export const MAX_ELEMENTS_PER_COLUMN = 100;
export const MAX_TITLE_LENGTH = 200;

export const failTooLarge = (): never => {
  throw new Error(
    `Flodesk file is too large. Maximum size is ${MAX_FLODESK_FILE_BYTES} bytes.`
  );
};

export const assertFileSize = (size: number) => {
  if (size > MAX_FLODESK_FILE_BYTES) failTooLarge();
};

export const requireColumnsCount = (
  value: unknown,
  path: string
): 1 | 2 | 3 | 4 => {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return failInvalidPage(path, "1, 2, 3, or 4");
};
