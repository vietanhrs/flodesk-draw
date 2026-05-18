import {
  handlers,
  registry,
  type ElementType,
  type PageElement,
} from "@src/pages/Editor/elements";
import type { ElementCatalogEntry } from "@src/pages/Editor/elements/base";

export interface ElementCategory {
  id: string;
  label: string;
}

export interface ElementDefinition extends ElementCatalogEntry {
  type: ElementType;
  create: () => PageElement;
}

export const elementCategories: ElementCategory[] = [
  { id: "text", label: "Text" },
  { id: "media", label: "Media" },
  { id: "buttons", label: "Buttons" },
  { id: "layout", label: "Layout" },
  { id: "social", label: "Social" },
];

export const elementDefinitions: ElementDefinition[] = handlers.map((h) => ({
  type: h.type,
  create: h.create,
  ...h.catalog,
}));

export const findElementDefinition = (type: ElementType) =>
  registry[type]
    ? ({
        type,
        create: registry[type].create,
        ...registry[type].catalog,
      } as ElementDefinition)
    : undefined;
