import type { ComponentType } from "react";

import { registry, type PageElement } from "@src/pages/Editor/elements";

interface RendererProps {
  element: PageElement;
}

export const ElementRenderer = ({ element }: RendererProps) => {
  const Renderer = registry[element.type].Renderer as ComponentType<{
    element: PageElement;
  }>;
  return <Renderer element={element} />;
};
