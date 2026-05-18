import { Stack } from "@flodesk/grain";

import { ColorInput } from "@src/pages/Editor/components/ConfigPane/controls/ColorInput";
import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";

import type { DividerElement } from "./types";

export const DividerForm = ({
  element,
  setProp,
}: ElementFormProps<DividerElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <ColorInput
        label="Color"
        value={element.color}
        onChange={(c) => setProp({ color: c }, dk("color"))}
      />
      <NumberField
        label="Thickness"
        value={element.thickness}
        min={1}
        max={20}
        unit="px"
        onChange={(v) => setProp({ thickness: v }, dk("thickness"))}
      />
      <NumberField
        label="Width"
        value={element.widthPct}
        min={5}
        max={100}
        unit="%"
        onChange={(v) => setProp({ widthPct: v }, dk("width"))}
      />
    </Stack>
  );
};
