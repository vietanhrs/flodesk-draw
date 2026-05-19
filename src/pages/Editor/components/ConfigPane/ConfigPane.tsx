import { useMemo, useState } from "react";

import { Box, Flex, Tab, TabGroup, Text } from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";

import { ElementTab } from "./ElementTab";
import { LayoutTab } from "./LayoutTab";
import { PageTab } from "./PageTab";

type TabKey = "page" | "layout" | "element";

export const ConfigPane = () => {
  const { page, selection } = useEditor();

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

  const defaultTab: TabKey =
    selection?.kind === "element"
      ? "element"
      : selection?.kind === "row"
        ? "layout"
        : "page";

  const [tab, setTab] = useState<TabKey>(defaultTab);
  const [prevDefault, setPrevDefault] = useState<TabKey>(defaultTab);
  if (prevDefault !== defaultTab) {
    setPrevDefault(defaultTab);
    setTab(defaultTab);
  }

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
    </Flex>
  );
};
