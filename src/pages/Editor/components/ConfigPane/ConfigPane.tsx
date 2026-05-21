import { useMemo, useState } from "react";

import { Box, Flex, Tab, TabGroup, Text } from "@flodesk/grain";

import type { PageElement } from "@src/pages/Editor/elements";
import {
  useEditorDocument,
  useEditorSelection,
} from "@src/pages/Editor/state/EditorContext";
import type { PageRow, Selection } from "@src/pages/Editor/state/types";

import { ElementTab } from "./ElementTab";
import { LayoutTab } from "./LayoutTab";
import { PageTab } from "./PageTab";

type TabKey = "page" | "layout" | "element";

interface ConfigPaneContentProps {
  selectedRow: PageRow | null;
  selectedElement: PageElement | null;
  selection: Selection;
}

const deriveSelectionTab = (selection: Selection): TabKey => {
  if (selection?.kind === "element") return "element";
  if (selection?.kind === "row") return "layout";
  return "page";
};

const selectionIdentity = (selection: Selection): string => {
  if (!selection) return "none";
  if (selection.kind === "element") {
    return `${selection.kind}:${selection.rowId}:${selection.columnIndex}:${selection.elementId}`;
  }
  return `${selection.kind}:${selection.rowId}`;
};

const ConfigPaneContent = ({
  selectedRow,
  selectedElement,
  selection,
}: ConfigPaneContentProps) => {
  const selectionKey = selectionIdentity(selection);
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey);
  const [tab, setTab] = useState<TabKey>(deriveSelectionTab(selection));

  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey);
    setTab(deriveSelectionTab(selection));
  }

  return (
    <>
      <Box
        paddingX="s2"
        paddingTop="s2"
        borderColor="border"
        borderWidth="1px"
        borderSide="none"
      >
        <TabGroup hasFullWidth>
          <Tab isActive={tab === "page"} onClick={() => setTab("page")}>
            Page
          </Tab>
          <Tab isActive={tab === "layout"} onClick={() => setTab("layout")}>
            Layout
          </Tab>
          <Tab isActive={tab === "element"} onClick={() => setTab("element")}>
            Element
          </Tab>
        </TabGroup>
      </Box>

      <Box
        flex="1 1 auto"
        minHeight={0}
        overflowY="auto"
        padding="m"
        backgroundColor="background"
      >
        {tab === "page" && <PageTab />}
        {tab === "layout" &&
          (selectedRow ? (
            <LayoutTab row={selectedRow} />
          ) : (
            <Text tag="p" size="s" color="content2">
              Select a row in the canvas to configure its layout.
            </Text>
          ))}
        {tab === "element" &&
          (selectedElement && selection?.kind === "element" ? (
            <ElementTab rowId={selection.rowId} element={selectedElement} />
          ) : (
            <Text tag="p" size="s" color="content2">
              Select an element in the canvas to configure it.
            </Text>
          ))}
      </Box>
    </>
  );
};

export const ConfigPane = () => {
  const { page } = useEditorDocument();
  const selection = useEditorSelection();

  const selectedRow = useMemo(() => {
    if (!selection) return null;
    return page.rows.find((r) => r.id === selection.rowId) ?? null;
  }, [page.rows, selection]);

  const selectedElement = useMemo(() => {
    if (!selection || selection.kind !== "element" || !selectedRow) return null;
    return (
      selectedRow.columns[selection.columnIndex]?.find(
        (el) => el.id === selection.elementId
      ) ?? null
    );
  }, [selectedRow, selection]);

  return (
    <Flex
      tag="aside"
      aria-label="Configuration"
      direction="column"
      wrap="nowrap"
      alignItems="stretch"
      flex="0 0 auto"
      width="320px"
      minHeight={0}
      backgroundColor="background2"
      borderColor="border"
      borderWidth="1px"
      borderSide="left"
    >
      <ConfigPaneContent
        selectedRow={selectedRow}
        selectedElement={selectedElement}
        selection={selection}
      />
    </Flex>
  );
};
