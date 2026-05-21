import {
  useExportFlow,
  useIsMobileEditorChrome,
  useSaveDraftFlow,
} from "./hooks";
import {
  useEditorActions,
  useEditorDocument,
  useEditorLoadedFile,
} from "./state/EditorContext";

export const useEditorSessionController = () => {
  const { page } = useEditorDocument();
  const loadedFile = useEditorLoadedFile();
  const { setLoadedFile } = useEditorActions();
  const isMobileEditorChrome = useIsMobileEditorChrome();
  const exportFlow = useExportFlow(page, loadedFile?.name);
  const saveFlow = useSaveDraftFlow(page, loadedFile, setLoadedFile);

  return {
    page,
    loadedFile,
    isMobileEditorChrome,
    exportFlow,
    saveFlow,
  };
};
