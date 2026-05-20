import type { ElementValidator } from "@src/pages/Editor/elements/base";
import { requireNumberInRange } from "@src/pages/Editor/elements/shared/validation";

export const validateSpacer: ElementValidator = (element, path) => {
  requireNumberInRange(element.height, `${path}.height`, 0, 400);
};
