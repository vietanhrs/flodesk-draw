import { Stack, Text, TextToggle, TextToggleGroup } from "@flodesk/grain";

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
      <TextToggleGroup role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <TextToggle
              key={String(opt.value)}
              role="radio"
              aria-checked={isActive}
              isActive={isActive}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </TextToggle>
          );
        })}
      </TextToggleGroup>
    </Stack>
  );
};
