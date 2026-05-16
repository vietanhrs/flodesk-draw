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
    saveToStorage,
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
    saveToStorage();
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 h-14 border-b border-border bg-background flex-none">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/templates"
          aria-label="Back to templates"
          title="Back to templates"
          className="w-8 h-8 inline-flex items-center justify-center rounded-md text-shade13 hover:bg-shade2 no-underline"
        >
          <IconArrowLeft width={18} height={18} />
        </Link>
        <form
          className="min-w-0 flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            commitTitle();
            (e.target as HTMLFormElement)
              .querySelector("input")
              ?.blur();
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

      <div className="flex items-center gap-2">
        <div
          role="toolbar"
          aria-label="History"
          className="inline-flex items-center rounded-md border border-border overflow-hidden"
        >
          <button
            type="button"
            aria-label="Undo"
            title="Undo (Ctrl/Cmd+Z)"
            disabled={!canUndo}
            onClick={undo}
            className="w-9 h-9 inline-flex items-center justify-center text-shade13 hover:bg-shade2 disabled:opacity-40 disabled:cursor-not-allowed border-r border-border"
          >
            <IconUndo width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Redo"
            title="Redo (Ctrl/Cmd+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
            className="w-9 h-9 inline-flex items-center justify-center text-shade13 hover:bg-shade2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconRedo width={16} height={16} />
          </button>
        </div>

        <div
          role="radiogroup"
          aria-label="Viewport"
          className="inline-flex items-center rounded-md border border-border overflow-hidden"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewport === "desktop"}
            aria-label="Desktop view"
            title="Desktop view"
            onClick={() => setViewport("desktop")}
            className={[
              "w-9 h-9 inline-flex items-center justify-center border-r border-border",
              viewport === "desktop"
                ? "bg-shade13 text-shade1"
                : "text-shade13 hover:bg-shade2",
            ].join(" ")}
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
            className={[
              "w-9 h-9 inline-flex items-center justify-center",
              viewport === "mobile"
                ? "bg-shade13 text-shade1"
                : "text-shade13 hover:bg-shade2",
            ].join(" ")}
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
