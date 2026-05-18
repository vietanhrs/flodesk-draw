import { Stack } from "@flodesk/grain";

import { ColorInput } from "@src/pages/Editor/components/ConfigPane/controls/ColorInput";
import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import { SegmentedField } from "@src/pages/Editor/components/ConfigPane/controls/SegmentedField";
import { TextField } from "@src/pages/Editor/components/ConfigPane/controls/TextField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";
import { alignOptions } from "@src/pages/Editor/elements/shared/alignOptions";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

import type { ButtonElement } from "./types";

export const ButtonForm = ({
  element,
  setProp,
}: ElementFormProps<ButtonElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <TextField
        label="Label"
        value={element.label}
        onChange={(v) => setProp({ label: v }, dk("label"))}
      />
      <TextField
        label="Link URL"
        value={element.href}
        onChange={(v) => setProp({ href: v }, dk("href"))}
        placeholder="https://example.com"
      />
      <ColorInput
        label="Background"
        value={element.backgroundColor}
        allowTransparent
        onChange={(c) => setProp({ backgroundColor: c }, dk("bg"))}
      />
      <ColorInput
        label="Text color"
        value={element.textColor}
        onChange={(c) => setProp({ textColor: c }, dk("textcolor"))}
      />
      <NumberField
        label="Font size"
        value={element.fontSize}
        min={10}
        max={32}
        unit="px"
        onChange={(v) => setProp({ fontSize: v }, dk("fontSize"))}
      />
      <NumberField
        label="Padding X"
        value={element.paddingX}
        min={0}
        max={80}
        unit="px"
        onChange={(v) => setProp({ paddingX: v }, dk("padx"))}
      />
      <NumberField
        label="Padding Y"
        value={element.paddingY}
        min={0}
        max={60}
        unit="px"
        onChange={(v) => setProp({ paddingY: v }, dk("pady"))}
      />
      <NumberField
        label="Corner radius"
        value={element.radius}
        min={0}
        max={50}
        unit="px"
        onChange={(v) => setProp({ radius: v }, dk("radius"))}
      />
      <NumberField
        label="Letter spacing"
        value={element.letterSpacing}
        min={0}
        max={10}
        step={0.5}
        onChange={(v) => setProp({ letterSpacing: v }, dk("ls"))}
      />
      <SegmentedField<TextAlign>
        label="Align"
        value={element.align}
        options={alignOptions}
        onChange={(v) => setProp({ align: v })}
      />
    </Stack>
  );
};
