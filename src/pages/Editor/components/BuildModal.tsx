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
      <div className="flex flex-col items-center gap-4 py-4 font-flodesk text-shade13">
        {status === "building" && <Spinner />}
        <p className="text-body m-0 text-center">{message}</p>
      </div>
    </Modal>
  );
};
