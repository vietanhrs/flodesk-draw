import { Stack } from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";

import { ColorInput } from "./controls/ColorInput";
import { NumberField } from "./controls/NumberField";

export const PageTab = () => {
  const { page, updatePage } = useEditor();

  return (
    <Stack gap="20px">
      <ColorInput
        label="Background"
        value={page.backgroundColor}
        onChange={(c) => updatePage({ backgroundColor: c }, "page-bg")}
      />
      <NumberField
        label="Horizontal padding"
        value={page.paddingX}
        min={0}
        max={200}
        unit="px"
        onChange={(v) => updatePage({ paddingX: v }, "page-padding-x")}
      />
      <NumberField
        label="Vertical padding"
        value={page.paddingY}
        min={0}
        max={200}
        unit="px"
        onChange={(v) => updatePage({ paddingY: v }, "page-padding-y")}
      />
    </Stack>
  );
};
