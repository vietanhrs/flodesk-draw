import {
  IconTextAlignCenter,
  IconTextAlignLeft,
  IconTextAlignRight,
  Stack,
  Text,
} from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";
import type { PageElement, TextAlign } from "@src/pages/Editor/state/types";

import { ColorInput } from "./controls/ColorInput";
import { NumberField } from "./controls/NumberField";
import { SegmentedField } from "./controls/SegmentedField";
import { TextField } from "./controls/TextField";

interface Props {
  rowId: string;
  element: PageElement;
}

const alignOptions = [
  {
    value: "left" as TextAlign,
    label: <IconTextAlignLeft width={14} height={14} />,
  },
  {
    value: "center" as TextAlign,
    label: <IconTextAlignCenter width={14} height={14} />,
  },
  {
    value: "right" as TextAlign,
    label: <IconTextAlignRight width={14} height={14} />,
  },
];

const fontFamilyOptions = [
  { value: "'Helvetica Neue', Arial, sans-serif", label: "Sans" },
  { value: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { value: "'Flodesk Sans', sans-serif", label: "Flodesk" },
];

const weightOptions = [
  { value: 300, label: "300" },
  { value: 400, label: "400" },
  { value: 500, label: "500" },
  { value: 600, label: "600" },
  { value: 700, label: "700" },
  { value: 900, label: "900" },
];

export const ElementTab = ({ rowId, element }: Props) => {
  const { updateElement } = useEditor();

  const setProp = <T extends PageElement>(
    patch: Partial<T>,
    debounceKey?: string
  ) => {
    updateElement<T>(rowId, element.id, patch, debounceKey);
  };

  const debounceKey = (k: string) => `el-${element.id}-${k}`;

  switch (element.type) {
    case "heading":
      return (
        <Stack gap="20px">
          <TextField
            label="Text"
            value={element.text}
            multiline
            onChange={(v) =>
              setProp<typeof element>({ text: v }, debounceKey("text"))
            }
          />
          <SegmentedField<1 | 2 | 3>
            label="Level"
            value={element.level}
            options={[
              { value: 1, label: "H1" },
              { value: 2, label: "H2" },
              { value: 3, label: "H3" },
            ]}
            onChange={(v) => setProp<typeof element>({ level: v })}
          />
          <SegmentedField<string>
            label="Font"
            value={element.fontFamily}
            options={fontFamilyOptions}
            onChange={(v) => setProp<typeof element>({ fontFamily: v })}
          />
          <SegmentedField<number>
            label="Weight"
            value={element.fontWeight}
            options={weightOptions}
            onChange={(v) => setProp<typeof element>({ fontWeight: v })}
          />
          <NumberField
            label="Font size"
            value={element.fontSize}
            min={10}
            max={200}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ fontSize: v }, debounceKey("fontSize"))
            }
          />
          <NumberField
            label="Letter spacing"
            value={element.letterSpacing}
            min={-10}
            max={20}
            step={0.5}
            onChange={(v) =>
              setProp<typeof element>({ letterSpacing: v }, debounceKey("ls"))
            }
          />
          <ColorInput
            label="Color"
            value={element.color}
            onChange={(c) =>
              setProp<typeof element>({ color: c }, debounceKey("color"))
            }
          />
          <SegmentedField<TextAlign>
            label="Align"
            value={element.align}
            options={alignOptions}
            onChange={(v) => setProp<typeof element>({ align: v })}
          />
        </Stack>
      );
    case "paragraph":
      return (
        <Stack gap="20px">
          <TextField
            label="Text"
            value={element.text}
            multiline
            onChange={(v) =>
              setProp<typeof element>({ text: v }, debounceKey("text"))
            }
          />
          <SegmentedField<string>
            label="Font"
            value={element.fontFamily}
            options={fontFamilyOptions}
            onChange={(v) => setProp<typeof element>({ fontFamily: v })}
          />
          <SegmentedField<number>
            label="Weight"
            value={element.fontWeight}
            options={weightOptions}
            onChange={(v) => setProp<typeof element>({ fontWeight: v })}
          />
          <NumberField
            label="Font size"
            value={element.fontSize}
            min={8}
            max={64}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ fontSize: v }, debounceKey("fontSize"))
            }
          />
          <NumberField
            label="Line height"
            value={element.lineHeight}
            min={1}
            max={3}
            step={0.05}
            onChange={(v) =>
              setProp<typeof element>({ lineHeight: v }, debounceKey("lh"))
            }
          />
          <ColorInput
            label="Color"
            value={element.color}
            onChange={(c) =>
              setProp<typeof element>({ color: c }, debounceKey("color"))
            }
          />
          <SegmentedField<TextAlign>
            label="Align"
            value={element.align}
            options={alignOptions}
            onChange={(v) => setProp<typeof element>({ align: v })}
          />
        </Stack>
      );
    case "quote":
      return (
        <Stack gap="20px">
          <TextField
            label="Quote"
            value={element.text}
            multiline
            onChange={(v) =>
              setProp<typeof element>({ text: v }, debounceKey("text"))
            }
          />
          <TextField
            label="Author"
            value={element.author}
            onChange={(v) =>
              setProp<typeof element>({ author: v }, debounceKey("author"))
            }
          />
          <SegmentedField<string>
            label="Font"
            value={element.fontFamily}
            options={fontFamilyOptions}
            onChange={(v) => setProp<typeof element>({ fontFamily: v })}
          />
          <NumberField
            label="Font size"
            value={element.fontSize}
            min={14}
            max={80}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ fontSize: v }, debounceKey("fontSize"))
            }
          />
          <ColorInput
            label="Color"
            value={element.color}
            onChange={(c) =>
              setProp<typeof element>({ color: c }, debounceKey("color"))
            }
          />
          <SegmentedField<TextAlign>
            label="Align"
            value={element.align}
            options={alignOptions}
            onChange={(v) => setProp<typeof element>({ align: v })}
          />
        </Stack>
      );
    case "button":
      return (
        <Stack gap="20px">
          <TextField
            label="Label"
            value={element.label}
            onChange={(v) =>
              setProp<typeof element>({ label: v }, debounceKey("label"))
            }
          />
          <TextField
            label="Link URL"
            value={element.href}
            onChange={(v) =>
              setProp<typeof element>({ href: v }, debounceKey("href"))
            }
            placeholder="https://example.com"
          />
          <ColorInput
            label="Background"
            value={element.backgroundColor}
            allowTransparent
            onChange={(c) =>
              setProp<typeof element>({ backgroundColor: c }, debounceKey("bg"))
            }
          />
          <ColorInput
            label="Text color"
            value={element.textColor}
            onChange={(c) =>
              setProp<typeof element>(
                { textColor: c },
                debounceKey("textcolor")
              )
            }
          />
          <NumberField
            label="Font size"
            value={element.fontSize}
            min={10}
            max={32}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ fontSize: v }, debounceKey("fontSize"))
            }
          />
          <NumberField
            label="Padding X"
            value={element.paddingX}
            min={0}
            max={80}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ paddingX: v }, debounceKey("padx"))
            }
          />
          <NumberField
            label="Padding Y"
            value={element.paddingY}
            min={0}
            max={60}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ paddingY: v }, debounceKey("pady"))
            }
          />
          <NumberField
            label="Corner radius"
            value={element.radius}
            min={0}
            max={50}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ radius: v }, debounceKey("radius"))
            }
          />
          <NumberField
            label="Letter spacing"
            value={element.letterSpacing}
            min={0}
            max={10}
            step={0.5}
            onChange={(v) =>
              setProp<typeof element>({ letterSpacing: v }, debounceKey("ls"))
            }
          />
          <SegmentedField<TextAlign>
            label="Align"
            value={element.align}
            options={alignOptions}
            onChange={(v) => setProp<typeof element>({ align: v })}
          />
        </Stack>
      );
    case "image":
      return (
        <Stack gap="20px">
          <TextField
            label="Image URL"
            value={element.src}
            onChange={(v) =>
              setProp<typeof element>({ src: v }, debounceKey("src"))
            }
          />
          <TextField
            label="Alt text"
            value={element.alt}
            onChange={(v) =>
              setProp<typeof element>({ alt: v }, debounceKey("alt"))
            }
          />
          <NumberField
            label="Width"
            value={element.widthPct}
            min={10}
            max={100}
            unit="%"
            onChange={(v) =>
              setProp<typeof element>({ widthPct: v }, debounceKey("width"))
            }
          />
          <NumberField
            label="Corner radius"
            value={element.radius}
            min={0}
            max={50}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ radius: v }, debounceKey("radius"))
            }
          />
          <SegmentedField<TextAlign>
            label="Align"
            value={element.align}
            options={alignOptions}
            onChange={(v) => setProp<typeof element>({ align: v })}
          />
        </Stack>
      );
    case "divider":
      return (
        <Stack gap="20px">
          <ColorInput
            label="Color"
            value={element.color}
            onChange={(c) =>
              setProp<typeof element>({ color: c }, debounceKey("color"))
            }
          />
          <NumberField
            label="Thickness"
            value={element.thickness}
            min={1}
            max={20}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>(
                { thickness: v },
                debounceKey("thickness")
              )
            }
          />
          <NumberField
            label="Width"
            value={element.widthPct}
            min={5}
            max={100}
            unit="%"
            onChange={(v) =>
              setProp<typeof element>({ widthPct: v }, debounceKey("width"))
            }
          />
        </Stack>
      );
    case "spacer":
      return (
        <Stack gap="20px">
          <NumberField
            label="Height"
            value={element.height}
            min={0}
            max={400}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ height: v }, debounceKey("height"))
            }
          />
        </Stack>
      );
    case "video":
      return (
        <Stack gap="20px">
          <TextField
            label="Embed URL"
            value={element.url}
            placeholder="https://www.youtube.com/embed/..."
            onChange={(v) =>
              setProp<typeof element>({ url: v }, debounceKey("url"))
            }
          />
          <NumberField
            label="Width"
            value={element.widthPct}
            min={20}
            max={100}
            unit="%"
            onChange={(v) =>
              setProp<typeof element>({ widthPct: v }, debounceKey("width"))
            }
          />
        </Stack>
      );
    case "social": {
      const updateLinkUrl = (index: number, url: string) => {
        const links = element.links.map((link, i) =>
          i === index ? { ...link, url } : link
        );
        setProp<typeof element>({ links }, debounceKey(`link-${index}`));
      };
      return (
        <Stack gap="20px">
          <ColorInput
            label="Icon color"
            value={element.color}
            onChange={(c) =>
              setProp<typeof element>({ color: c }, debounceKey("color"))
            }
          />
          <NumberField
            label="Icon size"
            value={element.size}
            min={12}
            max={48}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ size: v }, debounceKey("size"))
            }
          />
          <NumberField
            label="Gap"
            value={element.gap}
            min={0}
            max={48}
            unit="px"
            onChange={(v) =>
              setProp<typeof element>({ gap: v }, debounceKey("gap"))
            }
          />
          <SegmentedField<TextAlign>
            label="Align"
            value={element.align}
            options={alignOptions}
            onChange={(v) => setProp<typeof element>({ align: v })}
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
    }
  }
};
