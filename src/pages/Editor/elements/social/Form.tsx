import { Stack, Text } from "@flodesk/grain";

import { ColorInput } from "@src/pages/Editor/components/ConfigPane/controls/ColorInput";
import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";
import { SegmentedField } from "@src/pages/Editor/components/ConfigPane/controls/SegmentedField";
import { TextField } from "@src/pages/Editor/components/ConfigPane/controls/TextField";
import type { ElementFormProps } from "@src/pages/Editor/elements/base";
import { alignOptions } from "@src/pages/Editor/elements/shared/alignOptions";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

import type { SocialElement } from "./types";

export const SocialForm = ({
  element,
  setProp,
}: ElementFormProps<SocialElement>) => {
  const dk = (k: string) => `el-${element.id}-${k}`;

  const updateLinkUrl = (index: number, url: string) => {
    const links = element.links.map((link, i) =>
      i === index ? { ...link, url } : link
    );
    setProp({ links }, dk(`link-${index}`));
  };

  return (
    <Stack gap="20px">
      <ColorInput
        label="Icon color"
        value={element.color}
        onChange={(c) => setProp({ color: c }, dk("color"))}
      />
      <NumberField
        label="Icon size"
        value={element.size}
        min={12}
        max={48}
        unit="px"
        onChange={(v) => setProp({ size: v }, dk("size"))}
      />
      <NumberField
        label="Gap"
        value={element.gap}
        min={0}
        max={48}
        unit="px"
        onChange={(v) => setProp({ gap: v }, dk("gap"))}
      />
      <SegmentedField<TextAlign>
        label="Align"
        value={element.align}
        options={alignOptions}
        onChange={(v) => setProp({ align: v })}
      />
      <Stack gap="xs">
        <Text tag="span" variant="caps" color="content2">
          Links
        </Text>
        {element.links.map((link, i) => (
          <TextField
            key={`${link.platform}-${i}`}
            label={link.platform}
            value={link.url}
            onChange={(v) => updateLinkUrl(i, v)}
          />
        ))}
      </Stack>
    </Stack>
  );
};
