import type { ElementValidator } from "@src/pages/Editor/elements/base";
import {
  failInvalidPage,
  isRecord,
  MAX_ID_LENGTH,
  MAX_TYPE_LENGTH,
  requireString,
} from "@src/pages/Editor/elements/shared/validation";

import { validateButton } from "./button/validate";
import { validateDivider } from "./divider/validate";
import { validateHeading } from "./heading/validate";
import { validateImage } from "./image/validate";
import { validateParagraph } from "./paragraph/validate";
import { validateQuote } from "./quote/validate";
import type { ElementType } from "./registry";
import { validateSocial } from "./social/validate";
import { validateSpacer } from "./spacer/validate";
import { validateVideo } from "./video/validate";

const validators = {
  heading: validateHeading,
  paragraph: validateParagraph,
  quote: validateQuote,
  image: validateImage,
  video: validateVideo,
  button: validateButton,
  divider: validateDivider,
  spacer: validateSpacer,
  social: validateSocial,
} satisfies Record<ElementType, ElementValidator>;

const isElementType = (type: string): type is ElementType =>
  Object.hasOwn(validators, type);

const requireCommonElementFields = (
  element: Record<string, unknown>,
  path: string
): ElementType => {
  requireString(element.id, `${path}.id`, MAX_ID_LENGTH);
  const type = requireString(element.type, `${path}.type`, MAX_TYPE_LENGTH);
  if (!isElementType(type)) {
    return failInvalidPage(`${path}.type`, "a supported element type");
  }
  return type;
};

export const validateElement = (value: unknown, path: string) => {
  if (!isRecord(value)) return failInvalidPage(path, "an object");
  const type = requireCommonElementFields(value, path);
  validators[type](value, path);
};
