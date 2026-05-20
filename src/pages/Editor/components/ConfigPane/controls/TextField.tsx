import { useId } from "react";

import { Stack, Text, Textarea, TextInput } from "@flodesk/grain";

interface Props {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: Props) => {
  const labelId = useId();
  const fieldId = useId();

  return (
    <Stack gap="xs" style={{ display: "block" }}>
      <Text id={labelId} tag="span" variant="caps" color="content2">
        {label}
      </Text>
      {multiline ? (
        <Textarea
          id={fieldId}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-labelledby={labelId}
          rows={3}
        />
      ) : (
        <TextInput
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-labelledby={labelId}
          size="m"
        />
      )}
    </Stack>
  );
};
