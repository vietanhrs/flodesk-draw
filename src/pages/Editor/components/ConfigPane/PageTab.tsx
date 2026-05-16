import { ColorInput } from "./controls/ColorInput";
import { NumberField } from "./controls/NumberField";
import { useEditor } from "../../state/EditorContext";

export const PageTab = () => {
  const { page, updatePage } = useEditor();

  return (
    <div className="edt-fields">
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
    </div>
  );
};
