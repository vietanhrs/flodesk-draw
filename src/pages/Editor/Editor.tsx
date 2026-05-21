import { useEffect, useState } from "react";

import { Flex, Toast } from "@flodesk/grain";
import { useLocation, useParams } from "react-router-dom";

import { useIsMountedRef } from "@src/shared";

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

const MOBILE_EDITOR_QUERY = "(max-width: 767px)";

const useIsMobileEditorChrome = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" || !window.matchMedia
      ? false
      : window.matchMedia(MOBILE_EDITOR_QUERY).matches
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia(MOBILE_EDITOR_QUERY);
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return isMobile;
};

const editorSessionKey = (
  templateId: string | undefined,
  initialFile: LoadedFile | undefined
) => {
  if (initialFile) return `file:${initialFile.name}`;
  if (templateId) return `template:${templateId}`;
  return "scratch";
};

const EditorShell = () => {
  const isMountedRef = useIsMountedRef();
  const { page } = useEditorDocument();
  const loadedFile = useEditorLoadedFile();
  const { setLoadedFile } = useEditorActions();
  const isMobileEditorChrome = useIsMobileEditorChrome();
  const [build, setBuild] = useState<{
    isOpen: boolean;
    status: "building" | "done" | "error";
    message: string;
  }>({ isOpen: false, status: "building", message: "" });
  const [saveError, setSaveError] = useState("");
  const canUpdateState = () =>
    isMountedRef.current && typeof window !== "undefined";

  const handleBuild = async () => {
    setBuild({
      isOpen: true,
      status: "building",
      message: "Preparing your page…",
    });
    try {
      const result = await exportPageAsHtml(page, loadedFile?.name);
      if (!canUpdateState()) return;
      if (result.ok) {
        setBuild({
          isOpen: true,
          status: "done",
          message: "Your page has been exported as an HTML file.",
        });
      } else if (result.reason === "cancelled") {
        setBuild({ isOpen: false, status: "done", message: "" });
      }
    } catch (err) {
      if (!canUpdateState()) return;
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
      if (!canUpdateState()) return;
      if (result) {
        setLoadedFile({
          name: result.name,
          handle: result.handle,
          page,
        });
      }
    } catch (err) {
      if (!canUpdateState()) return;
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
      className={
        isMobileEditorChrome ? "edt-shell edt-shell--mobile" : "edt-shell"
      }
    >
      <Header
        onBuild={handleBuild}
        isBuilding={build.status === "building" && build.isOpen}
        onSave={handleSave}
        isCompact={isMobileEditorChrome}
      />
      {isMobileEditorChrome && (
        <div className="edt-mobile-notice" role="status">
          Please switch to desktop to be able to add elements & configure the
          page
        </div>
      )}
      <Flex
        tag="main"
        wrap="nowrap"
        alignItems="stretch"
        flex="1 1 auto"
        minHeight={0}
        className="edt-main"
      >
        {!isMobileEditorChrome && <ElementMenu />}
        <Canvas />
        {!isMobileEditorChrome && <ConfigPane />}
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
        onDismiss={() => {
          if (canUpdateState()) setSaveError("");
        }}
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
