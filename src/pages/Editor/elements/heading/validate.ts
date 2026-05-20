import type { ElementValidator } from "@src/pages/Editor/elements/base";
import {
  FONT_WEIGHTS,
  MAX_TEXT_LENGTH,
  requireColor,
  requireFontFamily,
  requireNumberInRange,
  requireOneOf,
  requireString,
  requireTextAlign,
} from "@src/pages/Editor/elements/shared/validation";

export const validateHeading: ElementValidator = (element, path) => {
  requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
  requireOneOf(element.level, [1, 2, 3] as const, `${path}.level`);
  requireColor(element.color, `${path}.color`);
  requireNumberInRange(element.fontSize, `${path}.fontSize`, 10, 200);
  requireOneOf(element.fontWeight, FONT_WEIGHTS, `${path}.fontWeight`);
  requireFontFamily(element.fontFamily, `${path}.fontFamily`);
  requireTextAlign(element.align, `${path}.align`);
  requireNumberInRange(element.letterSpacing, `${path}.letterSpacing`, -10, 20);
};
