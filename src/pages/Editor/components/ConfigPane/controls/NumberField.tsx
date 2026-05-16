import { useState } from "react";

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

  return (
    <label className="flex flex-col gap-1.5 font-flodesk text-shade13">
      <span className="text-xs font-medium text-content2 uppercase tracking-caps">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} slider`}
          className="flex-1 accent-blue9"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                (e.target as HTMLInputElement).blur();
            }}
            aria-label={label}
            className="w-16 h-8 px-2 rounded-md border border-border bg-background text-shade13 text-sm font-flodesk"
          />
          {unit && (
            <span className="text-xs text-content2 font-flodesk">{unit}</span>
          )}
        </div>
      </div>
    </label>
  );
};
