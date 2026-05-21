import { useLocation, useParams } from "react-router-dom";

import { EditorShell } from "./EditorShell";
import type { LoadedFile } from "./exporter/flodeskFile";
import { DragProvider } from "./state/DragContext";
import { EditorProvider } from "./state/EditorContext";

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
