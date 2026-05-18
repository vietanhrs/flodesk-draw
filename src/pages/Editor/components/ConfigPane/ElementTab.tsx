import type { ComponentType } from "react";

import {
  registry,
  type ElementFormProps,
  type PageElement,
} from "@src/pages/Editor/elements";
import { useEditor } from "@src/pages/Editor/state/EditorContext";

interface Props {
  rowId: string;
  element: PageElement;
}

export const ElementTab = ({ rowId, element }: Props) => {
  const { updateElement } = useEditor();

  const setProp = (patch: Partial<PageElement>, debounceKey?: string) => {
    updateElement<PageElement>(rowId, element.id, patch, debounceKey);
  };

  const Form = registry[element.type].Form as ComponentType<
    ElementFormProps<PageElement>
  >;
  return <Form rowId={rowId} element={element} setProp={setProp} />;
};
