import { useCallback } from "react";

import { Box, Flex } from "@flodesk/grain";

import {
  useEditorActions,
  useEditorDocument,
  useEditorViewport,
} from "@src/pages/Editor/state/EditorContext";
import {
  dragHasNewElement,
  readNewElementDrag,
} from "@src/pages/Editor/utils/dragData";

import { CanvasRow } from "./CanvasRow";

const VIEWPORT_WIDTH: Record<"desktop" | "mobile", number> = {
  desktop: 1080,
  mobile: 390,
};

export const Canvas = () => {
  const { page } = useEditorDocument();
  const viewport = useEditorViewport();
  const { setSelection, moveRow, addRowAt, addRowWithElement } =
    useEditorActions();

  const handleRowDropAt = useCallback(
    (fromRowId: string, placeAfter: boolean, targetRowId: string) => {
      const fromIndex = page.rows.findIndex((r) => r.id === fromRowId);
      let toIndex = page.rows.findIndex((r) => r.id === targetRowId);
      if (fromIndex < 0 || toIndex < 0) return;
      if (placeAfter) toIndex += 1;
      if (toIndex > fromIndex) toIndex -= 1;
      moveRow(fromIndex, toIndex);
    },
    [moveRow, page.rows]
  );

  const handleEmptyCanvasDrop = (e: React.DragEvent) => {
    if (!dragHasNewElement(e.dataTransfer)) return;
    e.preventDefault();
    const type = readNewElementDrag(e.dataTransfer);
    if (!type) return;
    addRowWithElement(type);
  };

  return (
    <Box
      flex="1 1 auto"
      minWidth={0}
      minHeight={0}
      overflow="auto"
      backgroundColor="background2"
      paddingY="l2"
      onClick={() => setSelection(null)}
    >
      <Box
        data-testid="editor-canvas"
        marginX="auto"
        backgroundColor="background"
        shadow="l"
        style={{
          maxWidth: VIEWPORT_WIDTH[viewport],
          backgroundColor: page.backgroundColor,
          paddingTop: page.paddingY,
          paddingBottom: page.paddingY,
          paddingLeft: page.paddingX,
          paddingRight: page.paddingX,
          transition: "max-width 260ms ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {page.rows.length === 0 ? (
          <Flex
            wrap="wrap"
            alignItems="center"
            justifyContent="center"
            gap="s2"
            margin="l2"
            minHeight="200px"
            padding="m"
            radius="m"
            className="edt-canvas-empty"
            onDragOver={(e) => {
              if (dragHasNewElement(e.dataTransfer)) e.preventDefault();
            }}
            onDrop={handleEmptyCanvasDrop}
          >
            <span>
              Click <kbd>+</kbd> or drop an element to start your page.
            </span>
            <button type="button" onClick={() => addRowAt(0)}>
              Add row
            </button>
          </Flex>
        ) : (
          page.rows.map((row, index) => (
            <CanvasRow
              key={row.id}
              row={row}
              rowIndex={index}
              totalRows={page.rows.length}
              onRowDropAt={(fromId, placeAfter) =>
                handleRowDropAt(fromId, placeAfter, row.id)
              }
            />
          ))
        )}
      </Box>
    </Box>
  );
};
