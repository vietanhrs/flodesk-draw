import { IconPlus } from "@flodesk/grain";

interface Props {
  position: "top" | "bottom";
  onClick: () => void;
}

export const AddRowButton = ({ position, onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={position === "top" ? "Add row above" : "Add row below"}
      title={position === "top" ? "Add row above" : "Add row below"}
      className={[
        "absolute left-1/2 -translate-x-1/2 z-20 w-7 h-7 rounded-full",
        "bg-shade13 text-shade1 hover:bg-shade12 transition-colors",
        "inline-flex items-center justify-center shadow-m",
        position === "top" ? "-top-3.5" : "-bottom-3.5",
      ].join(" ")}
    >
      <IconPlus width={14} height={14} />
    </button>
  );
};
