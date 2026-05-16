interface Option<T extends string | number> {
  value: T;
  label: React.ReactNode;
}

interface Props<T extends string | number> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (next: T) => void;
}

export const SegmentedField = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: Props<T>) => {
  return (
    <div className="flex flex-col gap-1.5 font-flodesk text-shade13">
      <span className="text-xs font-medium text-content2 uppercase tracking-caps">
        {label}
      </span>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-md overflow-hidden border border-border self-start"
      >
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(opt.value)}
              className={[
                "px-3 h-8 inline-flex items-center justify-center gap-1.5 text-sm not-last:border-r not-last:border-border",
                isActive
                  ? "bg-shade13 text-shade1"
                  : "bg-background text-content2 hover:text-shade13 hover:bg-shade1",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
