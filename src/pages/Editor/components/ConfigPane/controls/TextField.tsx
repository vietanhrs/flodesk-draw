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
      <label className="flex flex-col gap-1.5 font-flodesk text-shade13">
        <span className="text-xs font-medium text-content2 uppercase tracking-caps">
          {label}
        </span>
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          rows={3}
          className="rounded-md border border-border bg-background px-2.5 py-2 text-shade13 text-sm font-flodesk resize-y min-h-15"
        />
      </label>
    );
  }
  return (
    <label className="flex flex-col gap-1.5 font-flodesk text-shade13">
      <span className="text-xs font-medium text-content2 uppercase tracking-caps">
        {label}
      </span>
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
