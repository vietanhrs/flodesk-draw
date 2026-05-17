import { Stack, Text } from "@flodesk/grain";

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
    <Stack gap="xs">
      <Text tag="span" variant="caps" color="content2">
        {label}
      </Text>
      <div
        role="radiogroup"
        aria-label={label}
        className="edt-segmented"
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
              className={
                "edt-segmented__btn" +
                (isActive ? " edt-segmented__btn--active" : "")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </Stack>
  );
};
