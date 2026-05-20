import { useState } from "react";

import { Flex, Toast } from "@flodesk/grain";
import { useLocation, useParams } from "react-router-dom";

import "./editor.css";
import { BuildModal } from "./components/BuildModal";
import { Canvas } from "./components/Canvas/Canvas";
import { ConfigPane } from "./components/ConfigPane/ConfigPane";
import { ElementMenu } from "./components/ElementMenu/ElementMenu";
import { Header } from "./components/Header/Header";
import { exportPageAsHtml } from "./exporter/exportFile";
import { saveFlodeskFile, type LoadedFile } from "./exporter/flodeskFile";
import { DragProvider } from "./state/DragContext";
import {
  EditorProvider,
  useEditorActions,
  useEditorDocument,
  useEditorLoadedFile,
} from "./state/EditorContext";

interface EditorLocationState {
  loadedFile?: LoadedFile;
}

const editorSessionKey = (
  templateId: string | undefined,
  initialFile: LoadedFile | undefined
) => {
  if (initialFile) return `file:${initialFile.name}`;
  if (templateId) return `template:${templateId}`;
  return "scratch";
};

const EditorShell = () => {
  const { page } = useEditorDocument();
  const loadedFile = useEditorLoadedFile();
  const { setLoadedFile } = useEditorActions();
  const [build, setBuild] = useState<{
    isOpen: boolean;
    status: "building" | "done" | "error";
    message: string;
  }>({ isOpen: false, status: "building", message: "" });
  const [saveError, setSaveError] = useState("");

  const handleBuild = async () => {
    setBuild({
      isOpen: true,
      status: "building",
      message: "Preparing your page…",
    });
    try {
      const saved = await exportPageAsHtml(page, loadedFile?.name);
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

  const handleSave = async () => {
    setSaveError("");
    try {
      const result = await saveFlodeskFile(
        page,
        loadedFile?.handle,
        loadedFile?.name ?? page.title
      );
      if (result) {
        setLoadedFile({
          name: result.name,
          handle: result.handle,
          page,
        });
      }
    } catch (err) {
      console.error("Save failed", err);
      setSaveError("Could not save your .flodesk file. Please try again.");
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
        onSave={handleSave}
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
      <Toast
        isOpen={saveError.length > 0}
        variant="danger"
        dismissTimeout={5000}
        onDismiss={() => setSaveError("")}
      >
        <span role="alert">{saveError}</span>
      </Toast>
    </Flex>
  );
};

export const Editor = () => {
  const params = useParams<{ templateId?: string }>();
  const location = useLocation();
  const initialFile = (location.state as EditorLocationState | null)
    ?.loadedFile;
  const sessionKey = editorSessionKey(params.templateId, initialFile);

  return (
    <EditorProvider
      key={sessionKey}
      templateId={params.templateId}
      initialFile={initialFile}
    >
      <DragProvider>
        <EditorShell />
      </DragProvider>
    </EditorProvider>
  );
};
