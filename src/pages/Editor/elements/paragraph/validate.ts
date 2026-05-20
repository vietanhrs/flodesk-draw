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

export const validateParagraph: ElementValidator = (element, path) => {
  requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
  requireColor(element.color, `${path}.color`);
  requireNumberInRange(element.fontSize, `${path}.fontSize`, 8, 64);
  requireOneOf(element.fontWeight, FONT_WEIGHTS, `${path}.fontWeight`);
  requireFontFamily(element.fontFamily, `${path}.fontFamily`);
  requireTextAlign(element.align, `${path}.align`);
  requireNumberInRange(element.lineHeight, `${path}.lineHeight`, 1, 3);
};
