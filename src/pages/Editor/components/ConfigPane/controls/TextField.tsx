import { TextInput } from "@flodesk/grain";

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
  if (multiline) {
    return (
      <label className="edt-field">
        <span className="edt-field__label">{label}</span>
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          rows={3}
          className="edt-textarea"
        />
      </label>
    );
  }
  return (
    <label className="edt-field">
      <span className="edt-field__label">{label}</span>
      <TextInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        size="m"
      />
    </label>
  );
};
