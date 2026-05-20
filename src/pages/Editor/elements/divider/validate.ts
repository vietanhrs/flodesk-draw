import type { ElementValidator } from "@src/pages/Editor/elements/base";
import {
  requireColor,
  requireNumberInRange,
} from "@src/pages/Editor/elements/shared/validation";

export const validateDivider: ElementValidator = (element, path) => {
  requireColor(element.color, `${path}.color`);
  requireNumberInRange(element.thickness, `${path}.thickness`, 1, 20);
  requireNumberInRange(element.widthPct, `${path}.widthPct`, 5, 100);
};
