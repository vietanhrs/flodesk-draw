import { Flex, Modal, Spinner, Text } from "@flodesk/grain";

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
      <Flex
        direction="column"
        alignItems="center"
        gap="m"
        paddingY="m"
      >
        {status === "building" && <Spinner />}
        <Text size="m" color="shade13" align="center">
          {message}
        </Text>
      </Flex>
    </Modal>
  );
};
