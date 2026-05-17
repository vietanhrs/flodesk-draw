import { useState } from "react";

import { Flex, Stack, Text } from "@flodesk/grain";

interface Props {
  label: string;
  value: string;
  onChange: (next: string) => void;
  allowTransparent?: boolean;
}

const normalizeHex = (raw: string): string | null => {
  if (raw === "transparent") return "transparent";
  const trimmed = raw.trim();
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(trimmed)) return trimmed.toLowerCase();
  return null;
};

export const ColorInput = ({
  label,
  value,
  onChange,
  allowTransparent,
}: Props) => {
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setText(value);
  }

  const isTransparent =
    value === "transparent" || value === "rgba(0,0,0,0)";

  const swatchColor = isTransparent ? "#ffffff" : value;

  return (
    <Stack tag="label" gap="xs" style={{ display: "block" }}>
      <Text tag="span" variant="caps" color="content2">
        {label}
      </Text>
      <Flex wrap="nowrap" alignItems="stretch" gap="s">
        <div className="edt-color__swatch">
          {isTransparent && (
            <div aria-hidden="true" className="edt-color__check" />
          )}
          <input
            type="color"
            aria-label={`${label} color picker`}
            value={swatchColor}
            onChange={(e) => {
              setText(e.target.value);
              onChange(e.target.value);
            }}
            className="edt-color__picker"
          />
          <div
            aria-hidden="true"
            className="edt-color__fill"
            style={{
              backgroundColor: isTransparent ? "transparent" : value,
            }}
          />
        </div>
        <input
          type="text"
          aria-label={`${label} value`}
          value={text}
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            // Live-commit as soon as the typed value parses as a valid hex
            // so the canvas reflects the change without waiting for blur.
            // Invalid intermediate strings (e.g. "#ab") are kept local until
            // either a valid value is reached or onBlur reverts the field.
            const normalized = normalizeHex(next);
            if (normalized) onChange(normalized);
          }}
          onBlur={() => {
            const normalized = normalizeHex(text);
            if (normalized) onChange(normalized);
            else setText(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="edt-color__text"
        />
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange("transparent")}
            title="Set transparent"
            aria-label="Set transparent"
            className="edt-color__none"
          >
            None
          </button>
        )}
      </Flex>
    </Stack>
  );
};
