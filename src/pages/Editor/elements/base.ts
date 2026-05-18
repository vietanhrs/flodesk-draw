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

export interface ElementHandler<E extends BaseElement> {
  type: E["type"];
  create: () => E;
  catalog: ElementCatalogEntry;
  Renderer: ComponentType<{ element: E }>;
  Form: ComponentType<ElementFormProps<E>>;
  toHtml: (el: E) => string;
}
