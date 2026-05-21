import type { ElementValidator } from "@src/pages/Editor/elements/base";
import { isSafeVideoUrl } from "@src/pages/Editor/elements/shared/urls";
import {
  requireNumberInRange,
  requireUrl,
} from "@src/pages/Editor/elements/shared/validation";

export const validateVideo: ElementValidator = (element, path) => {
  requireUrl(
    element.url,
    `${path}.url`,
    isSafeVideoUrl,
    "a supported HTTPS video embed URL"
  );
  requireNumberInRange(element.widthPct, `${path}.widthPct`, 20, 100);
};
