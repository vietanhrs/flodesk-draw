import { Flex, Toast } from "@flodesk/grain";

import "./editor.css";
import { BuildModal } from "./components/BuildModal";
import { Canvas } from "./components/Canvas/Canvas";
import { ConfigPane } from "./components/ConfigPane/ConfigPane";
import { ElementMenu } from "./components/ElementMenu/ElementMenu";
import { Header } from "./components/Header/Header";
import { useEditorSessionController } from "./useEditorSessionController";

export const EditorShell = () => {
  const { isMobileEditorChrome, exportFlow, saveFlow } =
    useEditorSessionController();

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
        onBuild={exportFlow.handleBuild}
        isBuilding={
          exportFlow.build.status === "building" && exportFlow.build.isOpen
        }
        onSave={saveFlow.handleSave}
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
        isOpen={exportFlow.build.isOpen}
        status={exportFlow.build.status}
        message={exportFlow.build.message}
        onClose={exportFlow.closeBuildModal}
      />
      <Toast
        isOpen={saveFlow.saveError.length > 0}
        variant="danger"
        dismissTimeout={5000}
        onDismiss={saveFlow.dismissSaveError}
      >
        <span role="alert">{saveFlow.saveError}</span>
      </Toast>
    </Flex>
  );
};
