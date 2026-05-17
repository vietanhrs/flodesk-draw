import { Flex, Modal, Spinner, Text } from "@flodesk/grain";

interface Props {
  isOpen: boolean;
  status: "building" | "done" | "error";
  message: string;
  onClose: () => void;
}

export const BuildModal = ({ isOpen, status, message, onClose }: Props) => {
  const isBuilding = status === "building";

  // Grain's IconButton ships without an accessible name, so always supply one.
  // While building, the X must stay rendered (FocusTrap needs a focusable
  // element) but inert — the X calls `onCloseClick` directly, bypassing
  // `disableCloseHandler`, so we override its onClick via closeButtonProps.
  // Grain spreads closeButtonProps after its internal `onClick: onCloseClick`,
  // so our override wins.
  const closeButtonProps = isBuilding
    ? {
        "aria-label": "Close",
        "aria-disabled": true,
        onClick: (e: React.MouseEvent) => e.preventDefault(),
        style: { opacity: 0.4, cursor: "not-allowed" },
      }
    : { "aria-label": "Close" };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hasCloseButton
      closeButtonProps={closeButtonProps}
      cardMaxWidth="narrow"
      title="Build & export"
      disableCloseHandler={isBuilding}
    >
      <Flex direction="column" alignItems="center" gap="m" paddingY="m">
        {isBuilding && <Spinner />}
        <Text size="m" color="shade13" align="center">
          {message}
        </Text>
      </Flex>
    </Modal>
  );
};
