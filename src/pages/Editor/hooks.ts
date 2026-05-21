import { useEffect, useState } from "react";

import { useIsMountedRef } from "@src/shared";

import { MOBILE_EDITOR_QUERY } from "./constants";
import { exportPageAsHtml } from "./exporter/exportFile";
import { saveFlodeskFile, type LoadedFile } from "./exporter/flodeskFile";
import type { PageData } from "./state/types";

export const useIsMobileEditorChrome = () => {
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

interface BuildState {
  isOpen: boolean;
  status: "building" | "done" | "error";
  message: string;
}

const INITIAL_BUILD_STATE: BuildState = {
  isOpen: false,
  status: "building",
  message: "",
};

export const useExportFlow = (page: PageData, filenameHint?: string) => {
  const isMountedRef = useIsMountedRef();
  const [build, setBuild] = useState<BuildState>(INITIAL_BUILD_STATE);

  const canUpdateState = () =>
    isMountedRef.current && typeof window !== "undefined";

  const handleBuild = async () => {
    setBuild({
      isOpen: true,
      status: "building",
      message: "Preparing your page…",
    });
    try {
      const result = await exportPageAsHtml(page, filenameHint);
      if (!canUpdateState()) return;
      if (result.ok) {
        setBuild({
          isOpen: true,
          status: "done",
          message: "Your page has been exported as an HTML file.",
        });
      } else if (result.reason === "cancelled") {
        setBuild(INITIAL_BUILD_STATE);
      }
    } catch (error) {
      if (!canUpdateState()) return;
      console.error("Export failed", error);
      setBuild({
        isOpen: true,
        status: "error",
        message: "Something went wrong while exporting. Please try again.",
      });
    }
  };

  return {
    build,
    handleBuild,
    closeBuildModal: () => setBuild((state) => ({ ...state, isOpen: false })),
  };
};

export const useSaveDraftFlow = (
  page: PageData,
  loadedFile: LoadedFile | null,
  setLoadedFile: (loadedFile: LoadedFile) => void
) => {
  const isMountedRef = useIsMountedRef();
  const [saveError, setSaveError] = useState("");

  const canUpdateState = () =>
    isMountedRef.current && typeof window !== "undefined";

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
    } catch (error) {
      if (!canUpdateState()) return;
      console.error("Save failed", error);
      setSaveError("Could not save your .flodesk file. Please try again.");
    }
  };

  return {
    saveError,
    handleSave,
    dismissSaveError: () => {
      if (canUpdateState()) setSaveError("");
    },
  };
};
