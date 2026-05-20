import type { ElementValidator } from "@src/pages/Editor/elements/base";
import { isSafeImageUrl } from "@src/pages/Editor/elements/shared/urls";
import {
  MAX_SHORT_TEXT_LENGTH,
  requireNumberInRange,
  requireString,
  requireTextAlign,
  requireUrl,
} from "@src/pages/Editor/elements/shared/validation";

export const validateImage: ElementValidator = (element, path) => {
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
};
