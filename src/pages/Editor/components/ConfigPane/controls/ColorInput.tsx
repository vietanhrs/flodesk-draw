import { useState } from "react";

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
    <label className="flex flex-col gap-1.5 font-flodesk text-shade13">
      <span className="text-xs font-medium text-content2 uppercase tracking-caps">
        {label}
      </span>
      <div className="flex items-stretch gap-2">
        <div className="relative w-9 h-9 rounded-md border border-border overflow-hidden">
          {isTransparent && (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
              }}
            />
          )}
          <input
            type="color"
            aria-label={`${label} color picker`}
            value={swatchColor}
            onChange={(e) => {
              setText(e.target.value);
              onChange(e.target.value);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: isTransparent ? "transparent" : value,
            }}
          />
        </div>
        <input
          type="text"
          aria-label={`${label} value`}
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          className="flex-1 h-9 px-2 rounded-md border border-border bg-background text-shade13 text-sm font-flodesk"
        />
        {allowTransparent && (
          <button
            type="button"
            onClick={() => onChange("transparent")}
            title="Set transparent"
            aria-label="Set transparent"
            className="px-2 h-9 text-xs uppercase tracking-caps font-flodesk border border-border rounded-md text-content2 hover:text-shade13"
          >
            None
          </button>
        )}
      </div>
    </label>
  );
};
