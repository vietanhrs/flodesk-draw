import {
  failInvalidPage,
  isRecord,
  MAX_ID_LENGTH,
  MAX_TYPE_LENGTH,
  requireString,
} from "@src/pages/Editor/elements/shared/validation";

import { registry, type ElementType } from "./registry";

const isElementType = (type: string): type is ElementType =>
  Object.hasOwn(registry, type);

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
  registry[type].validate(value, path);
};
