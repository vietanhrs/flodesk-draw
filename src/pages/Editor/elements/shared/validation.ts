import {
  fontFamilyOptions,
  weightOptions,
} from "@src/pages/Editor/elements/shared/fontOptions";

export const MAX_SOCIAL_LINKS = 12;
export const MAX_ID_LENGTH = 128;
export const MAX_TYPE_LENGTH = 32;
export const MAX_TEXT_LENGTH = 10_000;
export const MAX_SHORT_TEXT_LENGTH = 1_000;
export const MAX_URL_LENGTH = 2_048;

const MAX_COLOR_LENGTH = 64;
const MAX_FONT_FAMILY_LENGTH = 128;
const COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const TRANSPARENT_VALUES = ["transparent", "rgba(0,0,0,0)"] as const;
const FONT_FAMILIES = fontFamilyOptions.map((option) => option.value);
export const FONT_WEIGHTS = weightOptions.map((option) => option.value);

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isUnknownArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isTextAlign = (value: unknown): value is "left" | "center" | "right" =>
  value === "left" || value === "center" || value === "right";

export const failInvalidPage = (path: string, expected: string): never => {
  throw new Error(
    `Flodesk file has invalid page data: ${path} must be ${expected}.`
  );
};

export const requireString = (
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

export const requireNumberInRange = (
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

export const requireTextAlign = (value: unknown, path: string) => {
  if (!isTextAlign(value)) failInvalidPage(path, "left, center, or right");
};

export const requireOneOf = (
  value: unknown,
  allowed: readonly unknown[],
  path: string
) => {
  if (!allowed.includes(value)) {
    failInvalidPage(path, allowed.map(String).join(", "));
  }
};

export const requireArray = (
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

export const requireColor = (
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

export const requireFontFamily = (value: unknown, path: string) => {
  const family = requireString(value, path, MAX_FONT_FAMILY_LENGTH);
  requireOneOf(family, FONT_FAMILIES, path);
};

export const requireUrl = (
  value: unknown,
  path: string,
  isSafeUrl: (url: string) => boolean,
  expected: string
) => {
  const url = requireString(value, path, MAX_URL_LENGTH);
  if (url.trim() && !isSafeUrl(url)) failInvalidPage(path, expected);
};
