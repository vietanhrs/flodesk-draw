import { Stack, Text } from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";
import type { PageRow } from "@src/pages/Editor/state/types";

import { ColorInput } from "./controls/ColorInput";
import { NumberField } from "./controls/NumberField";
import { SegmentedField } from "./controls/SegmentedField";

interface Props {
  row: PageRow;
}

export const LayoutTab = ({ row }: Props) => {
  const { updateRow, setRowColumnsCount, setColumnWidth } = useEditor();

  return (
    <Stack gap="20px">
      <ColorInput
        label="Background"
        value={row.backgroundColor}
        allowTransparent
        onChange={(c) =>
          updateRow(row.id, { backgroundColor: c }, `row-bg-${row.id}`)
        }
      />

      <SegmentedField<1 | 2 | 3 | 4>
        label="Columns"
        value={row.columnsCount}
        options={[
          { value: 1, label: "1" },
          { value: 2, label: "2" },
          { value: 3, label: "3" },
          { value: 4, label: "4" },
        ]}
        onChange={(c) => setRowColumnsCount(row.id, c)}
      />

      {row.columnsCount > 1 && (
        <Stack gap="xs">
          <Text tag="span" variant="caps" color="content2">
            Column widths
          </Text>
          {row.columnWidths.map((w, i) => (
            <NumberField
              key={i}
              label={`Column ${i + 1} weight`}
              value={Math.round(w * 100) / 100}
              min={0.1}
              max={10}
              step={0.1}
              onChange={(next) => setColumnWidth(row.id, i, next)}
            />
          ))}
        </Stack>
      )}

      <NumberField
        label="Column gap"
        value={row.columnGap}
        min={0}
        max={200}
        unit="px"
        onChange={(v) =>
          updateRow(row.id, { columnGap: v }, `row-gap-${row.id}`)
        }
      />
      <NumberField
        label="Horizontal padding"
        value={row.paddingX}
        min={0}
        max={200}
        unit="px"
        onChange={(v) =>
          updateRow(row.id, { paddingX: v }, `row-paddingx-${row.id}`)
        }
      />
      <NumberField
        label="Vertical padding"
        value={row.paddingY}
        min={0}
        max={200}
        unit="px"
        onChange={(v) =>
          updateRow(row.id, { paddingY: v }, `row-paddingy-${row.id}`)
        }
      />
      <NumberField
        label="Vertical margin"
        value={row.marginY}
        min={0}
        max={200}
        unit="px"
        onChange={(v) =>
          updateRow(row.id, { marginY: v }, `row-marginy-${row.id}`)
        }
      />
    </Stack>
  );
};
