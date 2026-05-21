import type { ComponentType } from "react";

import {
  registry,
  type ElementRendererProps,
  type PageElement,
} from "@src/pages/Editor/elements";

interface RendererProps {
  element: PageElement;
}

export const ElementRenderer = ({ element }: RendererProps) => {
  const Renderer = registry[element.type].Renderer as ComponentType<
    ElementRendererProps<PageElement>
  >;
  return <Renderer element={element} isPreview />;
};
