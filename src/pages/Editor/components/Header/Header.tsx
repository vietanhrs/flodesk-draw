import { useState } from "react";

import {
  Button,
  Flex,
  IconArrowLeft,
  IconDownload,
  IconMonitor,
  IconPhone,
  IconRedo,
  IconUndo,
  TextInput,
} from "@flodesk/grain";
import { Link } from "react-router-dom";

import { useEditor } from "@src/pages/Editor/state/EditorContext";

interface Props {
  onBuild: () => Promise<void>;
  isBuilding: boolean;
}

export const Header = ({ onBuild, isBuilding }: Props) => {
  const {
    page,
    updatePage,
    canUndo,
    canRedo,
    undo,
    redo,
    viewport,
    setViewport,
  } = useEditor();

  const [title, setTitle] = useState(page.title);
  const [prevTitle, setPrevTitle] = useState(page.title);
  if (prevTitle !== page.title) {
    setPrevTitle(page.title);
    setTitle(page.title);
  }

  const commitTitle = () => {
    if (title !== page.title) {
      updatePage({ title });
    }
  };

  return (
    <Flex
      tag="header"
      wrap="nowrap"
      alignItems="center"
      justifyContent="space-between"
      gap="m"
      paddingX="m"
      height="56px"
      backgroundColor="background"
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
        <Link
          to="/templates"
          aria-label="Back to templates"
          title="Back to templates"
          className="edt-back-link"
        >
          <IconArrowLeft width={18} height={18} />
        </Link>
        <form
          className="edt-title-form"
          onSubmit={(e) => {
            e.preventDefault();
            commitTitle();
            e.currentTarget.querySelector("input")?.blur();
          }}
        >
          <TextInput
            aria-label="Page title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            placeholder="Untitled page"
            size="m"
          />
        </form>
      </Flex>

      <Flex wrap="nowrap" alignItems="center" gap="s">
        <div role="toolbar" aria-label="History" className="edt-toolbar">
          <button
            type="button"
            aria-label="Undo"
            title="Undo (Ctrl/Cmd+Z)"
            disabled={!canUndo}
            onClick={undo}
            className="edt-toolbar-btn"
          >
            <IconUndo width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Redo"
            title="Redo (Ctrl/Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
            className="edt-toolbar-btn"
          >
            <IconRedo width={16} height={16} />
          </button>
        </div>

        <div role="radiogroup" aria-label="Viewport" className="edt-toolbar">
          <button
            type="button"
            role="radio"
            aria-checked={viewport === "desktop"}
            aria-label="Desktop view"
            title="Desktop view"
            onClick={() => setViewport("desktop")}
            className="edt-toolbar-btn"
          >
            <IconMonitor width={16} height={16} />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewport === "mobile"}
            aria-label="Mobile view"
            title="Mobile view"
            onClick={() => setViewport("mobile")}
            className="edt-toolbar-btn"
          >
            <IconPhone width={16} height={16} />
          </button>
        </div>

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
