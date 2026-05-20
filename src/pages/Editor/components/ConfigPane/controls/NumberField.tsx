import { useState } from "react";

import {
  Flex,
  IconButton,
  IconMinus,
  IconPlus,
  Slider,
  Stack,
  Text,
  TextInput,
} from "@flodesk/grain";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (next: number) => void;
}

export const NumberField = ({
  label,
  value,
  min = 0,
  max = 9999,
  step = 1,
  unit,
  onChange,
}: Props) => {
  const [draft, setDraft] = useState({ value, text: String(value) });
  const text = draft.value === value ? draft.text : String(value);

  const commit = (raw: string) => {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      setDraft({ value, text: String(value) });
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setDraft({ value: clamped, text: String(clamped) });
  };

  const nudge = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  };

  return (
    // Stack is a plain div, not a <label>: wrapping both nudge buttons in a
    // single <label> made the browser treat them as one form-control region,
    // so hovering one button bled its hover state onto the other. Each
    // control still has its own aria-label.
    <Stack gap="xs" style={{ display: "block" }}>
      <Text tag="span" variant="caps" color="content2">
        {label}
      </Text>
      <Flex wrap="nowrap" alignItems="center" gap="s">
        <IconButton
          icon={<IconMinus />}
          aria-label={`Decrease ${label}`}
          isDisabled={value <= min}
          onClick={() => nudge(-step)}
        />
        {/* Grain's Slider spreads extra props onto its inner <input>, not its
            outer <div>, so neither className nor style on <Slider> would size
            the wrapper. Wrap it in a flex item that owns the width. */}
        <div className="edt-field__slider">
          <Slider
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${label} slider`}
          />
        </div>
        <IconButton
          icon={<IconPlus />}
          aria-label={`Increase ${label}`}
          isDisabled={value >= max}
          onClick={() => nudge(step)}
        />
        <div style={{ flex: "0 0 64px", width: 64 }}>
          <TextInput
            type="number"
            min={min}
            max={max}
            step={step}
            value={text}
            onChange={(e) => {
              const raw = e.target.value;
              // Live-commit when the typed value is a finite, in-range number
              // so the canvas reflects the change without waiting for blur.
              // Out-of-range or non-numeric input stays local until blur, which
              // clamps via `commit()`.
              const parsed = Number(raw);
              if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                onChange(parsed);
                setDraft({ value: parsed, text: raw });
              } else {
                setDraft({ value, text: raw });
              }
            }}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            aria-label={label}
            size="m"
          />
        </div>
        {unit && (
          <Text tag="span" size="s" color="content2">
            {unit}
          </Text>
        )}
      </Flex>
    </Stack>
  );
};
