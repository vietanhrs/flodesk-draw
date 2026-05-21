import type { ComponentType, SVGProps } from "react";

export interface BaseElement {
  id: string;
  type: string;
}

export interface ElementCatalogEntry {
  name: string;
  category: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface ElementFormProps<E extends BaseElement> {
  rowId: string;
  element: E;
  setProp: (patch: Partial<E>, debounceKey?: string) => void;
}

export type ElementValidator = (
  element: Record<string, unknown>,
  path: string
) => void;

export interface ElementRendererProps<E extends BaseElement> {
  element: E;
  isPreview?: boolean;
}

export interface ElementHandler<E extends BaseElement> {
  type: E["type"];
  create: () => E;
  catalog: ElementCatalogEntry;
  Renderer: ComponentType<ElementRendererProps<E>>;
  Form: ComponentType<ElementFormProps<E>>;
  toHtml: (el: E) => string;
  validate: ElementValidator;
}
