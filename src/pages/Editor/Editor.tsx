import { useState } from "react";

import { Flex } from "@flodesk/grain";
import { useParams } from "react-router-dom";

import "./editor.css";
import { BuildModal } from "./components/BuildModal";
import { Canvas } from "./components/Canvas/Canvas";
import { ConfigPane } from "./components/ConfigPane/ConfigPane";
import { ElementMenu } from "./components/ElementMenu/ElementMenu";
import { Header } from "./components/Header/Header";
import { exportPageAsHtml } from "./exporter/exportFile";
import { DragProvider } from "./state/DragContext";
import { EditorProvider, useEditor } from "./state/EditorContext";

const EditorShell = () => {
  const { page } = useEditor();
  const [build, setBuild] = useState<{
    isOpen: boolean;
    status: "building" | "done" | "error";
    message: string;
  }>({ isOpen: false, status: "building", message: "" });

  const handleBuild = async () => {
    setBuild({
      isOpen: true,
      status: "building",
      message: "Preparing your page…",
    });
    try {
      const saved = await exportPageAsHtml(page);
      if (saved) {
        setBuild({
          isOpen: true,
          status: "done",
          message: "Your page has been exported as an HTML file.",
        });
      } else {
        setBuild({ isOpen: false, status: "done", message: "" });
      }
    } catch (err) {
      console.error("Export failed", err);
      setBuild({
        isOpen: true,
        status: "error",
        message: "Something went wrong while exporting. Please try again.",
      });
    }
  };

  return (
    <Flex
      direction="column"
      wrap="nowrap"
      alignItems="stretch"
      height="100vh"
      width="100%"
      backgroundColor="background2"
    >
      <Header
        onBuild={handleBuild}
        isBuilding={build.status === "building" && build.isOpen}
      />
      <Flex wrap="nowrap" alignItems="stretch" flex="1 1 auto" minHeight={0}>
        <ElementMenu />
        <Canvas />
        <ConfigPane />
      </Flex>
      <BuildModal
        isOpen={build.isOpen}
        status={build.status}
        message={build.message}
        onClose={() => setBuild((b) => ({ ...b, isOpen: false }))}
      />
    </Flex>
  );
};

export const Editor = () => {
  const params = useParams<{ templateId?: string }>();
  return (
    <EditorProvider templateId={params.templateId}>
      <DragProvider>
        <EditorShell />
      </DragProvider>
    </EditorProvider>
  );
};
