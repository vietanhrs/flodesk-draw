import {
  Arrange,
  Button,
  Flex,
  IconButton,
  IconDownload,
  IconMonitor,
  IconPhone,
  IconRedo,
  IconUndo,
  IconUpload,
  Text,
  TextButton,
} from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";
import { FlodeskLogo } from "@src/shared";

interface Props {
  onBuild: () => Promise<void>;
  isBuilding: boolean;
  onSave: () => Promise<void>;
}

export const Header = ({ onBuild, isBuilding, onSave }: Props) => {
  const { canUndo, canRedo, undo, redo, viewport, setViewport, loadedFile } =
    useEditor();
  const savesToOpenedFile = !loadedFile || Boolean(loadedFile.handle);
  const saveLabel = savesToOpenedFile ? "Save" : "Download copy";

  return (
    <Flex
      tag="header"
      wrap="nowrap"
      alignItems="center"
      justifyContent="space-between"
      gap="m"
      paddingX="m"
      height="64px"
      backgroundColor="shade1"
      borderColor="border"
      borderWidth="1px"
      borderSide="bottom"
      flex="0 0 auto"
    >
      <Flex
        wrap="nowrap"
        alignItems="center"
        gap="s2"
        minWidth={0}
        flex="1 1 auto"
      >
        <FlodeskLogo className="edt-header-logo" />
        <Flex
          wrap="nowrap"
          alignItems="center"
          gap="xs"
          minWidth={0}
          flex="1 1 auto"
        >
          {loadedFile && (
            <Text
              tag="span"
              size="m"
              color="shade13"
              className="edt-header-filename"
              aria-label="Current file"
            >
              {loadedFile.name}
            </Text>
          )}
          <IconButton
            type="button"
            aria-label={saveLabel}
            title={saveLabel}
            onClick={() => {
              void onSave();
            }}
            icon={
              savesToOpenedFile ? (
                <IconUpload width={16} height={16} />
              ) : (
                <IconDownload width={16} height={16} />
              )
            }
          />
        </Flex>
      </Flex>

      <Flex wrap="nowrap" alignItems="center" gap="s">
        <Arrange gap="s" role="toolbar" aria-label="History">
          <TextButton
            type="button"
            aria-label="Undo"
            title="Undo (Ctrl/Cmd+Z)"
            isDisabled={!canUndo}
            onClick={undo}
            icon={<IconUndo width={16} height={16} />}
          >
            Undo
          </TextButton>
          <TextButton
            type="button"
            aria-label="Redo"
            title="Redo (Ctrl/Cmd+Shift+Z)"
            isDisabled={!canRedo}
            onClick={redo}
            icon={<IconRedo width={16} height={16} />}
          >
            Redo
          </TextButton>
        </Arrange>

        <Arrange role="radiogroup" aria-label="Viewport">
          <IconButton
            role="radio"
            type="button"
            isActive={viewport === "desktop"}
            aria-checked={viewport === "desktop"}
            aria-label="Desktop view"
            title="Desktop view"
            onClick={() => setViewport("desktop")}
            icon={<IconMonitor width={16} height={16} />}
          />
          <IconButton
            role="radio"
            type="button"
            isActive={viewport === "mobile"}
            aria-checked={viewport === "mobile"}
            aria-label="Mobile view"
            title="Mobile view"
            onClick={() => setViewport("mobile")}
            icon={<IconPhone width={16} height={16} />}
          />
        </Arrange>

        <Button
          variant="accent"
          size="m"
          icon={<IconDownload width={14} height={14} />}
          isDisabled={isBuilding}
          hasSpinner={isBuilding}
          onClick={() => {
            void onBuild();
          }}
        >
          {isBuilding ? "Building…" : "Build & export"}
        </Button>
      </Flex>
    </Flex>
  );
};
