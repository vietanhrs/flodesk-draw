import { useState } from "react";

import {
  Button,
  IconArrowLeft,
  IconDownload,
  IconMonitor,
  IconPhone,
  IconRedo,
  IconUndo,
  TextInput,
} from "@flodesk/grain";
import { Link } from "react-router-dom";

import { useEditor } from "../../state/EditorContext";

interface Props {
  onBuild: () => void;
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
    <header className="edt-header">
      <div className="edt-header__left">
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
            (e.target as HTMLFormElement).querySelector("input")?.blur();
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
      </div>

      <div className="edt-header__right">
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

        <div
          role="radiogroup"
          aria-label="Viewport"
          className="edt-toolbar"
        >
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
          onClick={onBuild}
        >
          {isBuilding ? "Building…" : "Build & export"}
        </Button>
      </div>
    </header>
  );
};
