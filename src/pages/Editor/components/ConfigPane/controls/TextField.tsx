import { Stack, Text, TextInput } from "@flodesk/grain";

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
  return (
    <Stack tag="label" gap="xs" style={{ display: "block" }}>
      <Text tag="span" variant="caps" color="content2">
        {label}
      </Text>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          rows={3}
          className="edt-textarea"
        />
      ) : (
        <TextInput
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          size="m"
        />
      )}
    </Stack>
  );
};
