import { useMemo, useState } from "react";

import { Tab, TabGroup } from "@flodesk/grain";

import { ElementTab } from "./ElementTab";
import { LayoutTab } from "./LayoutTab";
import { PageTab } from "./PageTab";
import { useEditor } from "../../state/EditorContext";

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
    <aside aria-label="Configuration" className="edt-config">
      <div className="edt-config__tabs">
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
      </div>

      <div className="edt-config__body">
        {tab === "page" && <PageTab />}
        {tab === "layout" &&
          (selectedRow ? (
            <LayoutTab row={selectedRow} />
          ) : (
            <p className="edt-config__empty">
              Select a row in the canvas to configure its layout.
            </p>
          ))}
        {tab === "element" &&
          (selectedElement && selection?.kind === "element" ? (
            <ElementTab
              rowId={selection.rowId}
              element={selectedElement}
            />
          ) : (
            <p className="edt-config__empty">
              Select an element in the canvas to configure it.
            </p>
          ))}
      </div>
    </aside>
  );
};
