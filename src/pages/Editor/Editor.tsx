import { Flex, Toast } from "@flodesk/grain";
import { useLocation, useParams } from "react-router-dom";

import "./editor.css";
import { BuildModal } from "./components/BuildModal";
import { Canvas } from "./components/Canvas/Canvas";
import { ConfigPane } from "./components/ConfigPane/ConfigPane";
import { ElementMenu } from "./components/ElementMenu/ElementMenu";
import { Header } from "./components/Header/Header";
import type { LoadedFile } from "./exporter/flodeskFile";
import {
  useExportFlow,
  useIsMobileEditorChrome,
  useSaveDraftFlow,
} from "./hooks";
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
  const isMobileEditorChrome = useIsMobileEditorChrome();
  const { build, handleBuild, closeBuildModal } = useExportFlow(
    page,
    loadedFile?.name
  );
  const { saveError, handleSave, dismissSaveError } = useSaveDraftFlow(
    page,
    loadedFile,
    setLoadedFile
  );

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
        onClose={closeBuildModal}
      />
      <Toast
        isOpen={saveError.length > 0}
        variant="danger"
        dismissTimeout={5000}
        onDismiss={dismissSaveError}
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
