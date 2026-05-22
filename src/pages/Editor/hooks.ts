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

interface SaveToastState {
  isOpen: boolean;
  variant: "success" | "danger";
  message: string;
}

const INITIAL_BUILD_STATE: BuildState = {
  isOpen: false,
  status: "building",
  message: "",
};

const INITIAL_SAVE_TOAST_STATE: SaveToastState = {
  isOpen: false,
  variant: "success",
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
  const [saveToast, setSaveToast] = useState<SaveToastState>(
    INITIAL_SAVE_TOAST_STATE
  );

  const canUpdateState = () =>
    isMountedRef.current && typeof window !== "undefined";

  const handleSave = async () => {
    setSaveToast(INITIAL_SAVE_TOAST_STATE);
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
        setSaveToast({
          isOpen: true,
          variant: "success",
          message: "Your .flodesk file has been saved.",
        });
      }
    } catch {
      if (!canUpdateState()) return;
      setSaveToast({
        isOpen: true,
        variant: "danger",
        message: "Could not save your .flodesk file. Please try again.",
      });
    }
  };

  return {
    saveToast,
    handleSave,
    dismissSaveToast: () => {
      if (canUpdateState()) setSaveToast(INITIAL_SAVE_TOAST_STATE);
    },
  };
};
