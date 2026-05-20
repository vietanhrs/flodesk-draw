import type { ElementValidator } from "@src/pages/Editor/elements/base";
import {
  MAX_SHORT_TEXT_LENGTH,
  MAX_TEXT_LENGTH,
  requireColor,
  requireFontFamily,
  requireNumberInRange,
  requireString,
  requireTextAlign,
} from "@src/pages/Editor/elements/shared/validation";

export const validateQuote: ElementValidator = (element, path) => {
  requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
  requireString(element.author, `${path}.author`, MAX_SHORT_TEXT_LENGTH);
  requireColor(element.color, `${path}.color`);
  requireNumberInRange(element.fontSize, `${path}.fontSize`, 14, 80);
  requireFontFamily(element.fontFamily, `${path}.fontFamily`);
  requireTextAlign(element.align, `${path}.align`);
};
