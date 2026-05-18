import type { ComponentType } from "react";

import { Flex, Text } from "@flodesk/grain";

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

  const handler = registry[element.type];
  const Form = handler.Form as ComponentType<ElementFormProps<PageElement>>;
  return (
    <Flex direction="column" wrap="nowrap" alignItems="stretch" gap="m">
      <Text tag="h3" size="m" weight="semibold">
        {handler.catalog.name}
      </Text>
      <Form rowId={rowId} element={element} setProp={setProp} />
    </Flex>
  );
};
