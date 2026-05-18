import { Stack } from "@flodesk/grain";

import { ColorInput } from "@src/pages/Editor/components/ConfigPane/controls/ColorInput";
import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import { SegmentedField } from "@src/pages/Editor/components/ConfigPane/controls/SegmentedField";
import { TextField } from "@src/pages/Editor/components/ConfigPane/controls/TextField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";
import { alignOptions } from "@src/pages/Editor/elements/shared/alignOptions";
import {
  fontFamilyOptions,
  weightOptions,
} from "@src/pages/Editor/elements/shared/fontOptions";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

import type { HeadingElement } from "./types";

export const HeadingForm = ({
  element,
  setProp,
}: ElementFormProps<HeadingElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <TextField
        label="Text"
        value={element.text}
        multiline
        onChange={(v) => setProp({ text: v }, dk("text"))}
      />
      <SegmentedField<1 | 2 | 3>
        label="Level"
        value={element.level}
        options={[
          { value: 1, label: "H1" },
          { value: 2, label: "H2" },
          { value: 3, label: "H3" },
        ]}
        onChange={(v) => setProp({ level: v })}
      />
      <SegmentedField<string>
        label="Font"
        value={element.fontFamily}
        options={fontFamilyOptions}
        onChange={(v) => setProp({ fontFamily: v })}
      />
      <SegmentedField<number>
        label="Weight"
        value={element.fontWeight}
        options={weightOptions}
        onChange={(v) => setProp({ fontWeight: v })}
      />
      <NumberField
        label="Font size"
        value={element.fontSize}
        min={10}
        max={200}
        unit="px"
        onChange={(v) => setProp({ fontSize: v }, dk("fontSize"))}
      />
      <NumberField
        label="Letter spacing"
        value={element.letterSpacing}
        min={-10}
        max={20}
        step={0.5}
        onChange={(v) => setProp({ letterSpacing: v }, dk("ls"))}
      />
      <ColorInput
        label="Color"
        value={element.color}
        onChange={(c) => setProp({ color: c }, dk("color"))}
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
