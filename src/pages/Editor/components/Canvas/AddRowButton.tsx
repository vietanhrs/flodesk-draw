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
      className={
        "edt-add-row-btn " +
        (position === "top"
          ? "edt-add-row-btn--top"
          : "edt-add-row-btn--bottom")
      }
    >
      <IconPlus width={14} height={14} />
    </button>
  );
};
