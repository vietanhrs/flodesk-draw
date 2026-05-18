import { Stack } from "@flodesk/grain";

import { ColorInput } from "@src/pages/Editor/components/ConfigPane/controls/ColorInput";
import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import { SegmentedField } from "@src/pages/Editor/components/ConfigPane/controls/SegmentedField";
import { TextField } from "@src/pages/Editor/components/ConfigPane/controls/TextField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";
import { alignOptions } from "@src/pages/Editor/elements/shared/alignOptions";
import { fontFamilyOptions } from "@src/pages/Editor/elements/shared/fontOptions";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

import type { QuoteElement } from "./types";

export const QuoteForm = ({
  element,
  setProp,
}: ElementFormProps<QuoteElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <TextField
        label="Quote"
        value={element.text}
        multiline
        onChange={(v) => setProp({ text: v }, dk("text"))}
      />
      <TextField
        label="Author"
        value={element.author}
        onChange={(v) => setProp({ author: v }, dk("author"))}
      />
      <SegmentedField<string>
        label="Font"
        value={element.fontFamily}
        options={fontFamilyOptions}
        onChange={(v) => setProp({ fontFamily: v })}
      />
      <NumberField
        label="Font size"
        value={element.fontSize}
        min={14}
        max={80}
        unit="px"
        onChange={(v) => setProp({ fontSize: v }, dk("fontSize"))}
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
