import { Stack } from "@flodesk/grain";

import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";

import type { SpacerElement } from "./types";

export const SpacerForm = ({
  element,
  setProp,
}: ElementFormProps<SpacerElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <NumberField
        label="Height"
        value={element.height}
        min={0}
        max={400}
        unit="px"
        onChange={(v) => setProp({ height: v }, dk("height"))}
      />
    </Stack>
  );
};
