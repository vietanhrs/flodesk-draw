import { Modal, Spinner } from "@flodesk/grain";

interface Props {
  isOpen: boolean;
  status: "building" | "done" | "error";
  message: string;
  onClose: () => void;
}

export const BuildModal = ({ isOpen, status, message, onClose }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={status === "building" ? undefined : onClose}
      hasCloseButton={status !== "building"}
      cardMaxWidth="narrow"
      title="Build & export"
      disableCloseHandler={status === "building"}
    >
      <div className="edt-build">
        {status === "building" && <Spinner />}
        <p>{message}</p>
      </div>
    </Modal>
  );
};
