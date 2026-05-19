import { useState } from "react";

import {
  Flex,
  IconButton,
  IconMinus,
  IconPlus,
  Slider,
  Stack,
  Text,
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
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setText(String(value));
  }

  const commit = (raw: string) => {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    const clamped = Math.min(max, Math.max(min, parsed));
    onChange(clamped);
    setText(String(clamped));
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
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={text}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            // Live-commit when the typed value is a finite, in-range number
            // so the canvas reflects the change without waiting for blur.
            // Out-of-range or non-numeric input stays local until blur, which
            // clamps via `commit()`.
            const parsed = Number(raw);
            if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
              onChange(parsed);
            }
          }}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          aria-label={label}
          className="edt-field__numeric"
        />
        {unit && (
          <Text tag="span" size="s" color="content2">
            {unit}
          </Text>
        )}
      </Flex>
    </Stack>
  );
};
