import type { ElementValidator } from "@src/pages/Editor/elements/base";
import { isSafeLinkUrl } from "@src/pages/Editor/elements/shared/urls";
import {
  MAX_SHORT_TEXT_LENGTH,
  requireColor,
  requireNumberInRange,
  requireString,
  requireTextAlign,
  requireUrl,
} from "@src/pages/Editor/elements/shared/validation";

export const validateButton: ElementValidator = (element, path) => {
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
  requireNumberInRange(element.letterSpacing, `${path}.letterSpacing`, 0, 10);
};
