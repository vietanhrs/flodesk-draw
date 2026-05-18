import { Stack } from "@flodesk/grain";

import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import { TextField } from "@src/pages/Editor/components/ConfigPane/controls/TextField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";

import type { VideoElement } from "./types";

export const VideoForm = ({
  element,
  setProp,
}: ElementFormProps<VideoElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;
  return (
    <Stack gap="20px">
      <TextField
        label="Embed URL"
        value={element.url}
        placeholder="https://www.youtube.com/embed/..."
        onChange={(v) => setProp({ url: v }, dk("url"))}
      />
      <NumberField
        label="Width"
        value={element.widthPct}
        min={20}
        max={100}
        unit="%"
        onChange={(v) => setProp({ widthPct: v }, dk("width"))}
      />
    </Stack>
  );
};
