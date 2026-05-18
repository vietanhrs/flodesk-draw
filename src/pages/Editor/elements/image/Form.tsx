import { Stack } from "@flodesk/grain";

import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import { SegmentedField } from "@src/pages/Editor/components/ConfigPane/controls/SegmentedField";
import { TextField } from "@src/pages/Editor/components/ConfigPane/controls/TextField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";
import { alignOptions } from "@src/pages/Editor/elements/shared/alignOptions";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

import type { ImageElement } from "./types";

export const ImageForm = ({
  element,
  setProp,
}: ElementFormProps<ImageElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <TextField
        label="Image URL"
        value={element.src}
        onChange={(v) => setProp({ src: v }, dk("src"))}
      />
      <TextField
        label="Alt text"
        value={element.alt}
        onChange={(v) => setProp({ alt: v }, dk("alt"))}
      />
      <NumberField
        label="Width"
        value={element.widthPct}
        min={10}
        max={100}
        unit="%"
        onChange={(v) => setProp({ widthPct: v }, dk("width"))}
      />
      <NumberField
        label="Corner radius"
        value={element.radius}
        min={0}
        max={50}
        unit="px"
        onChange={(v) => setProp({ radius: v }, dk("radius"))}
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
