import type { PageData } from "@src/pages/Editor/state/types";

import type { FLODESK_FILE_VERSION } from "./constants";

export interface FlodeskFile {
  version: typeof FLODESK_FILE_VERSION;
  page: PageData;
}

export interface LoadedFile {
  /** File name without the .flodesk extension. */
  name: string;
  page: PageData;
  /** Present when the FS Access API was used; lets us re-save without prompting. */
  handle?: FileSystemFileHandle;
}

export interface SaveResult {
  name: string;
  handle?: FileSystemFileHandle;
}

export interface FilePickerType {
  description: string;
  accept: Record<string, string[]>;
}

export interface FilePickerOptions {
  suggestedName?: string;
  types?: FilePickerType[];
}

export interface ShowOpenFilePicker {
  (
    options: FilePickerOptions & { multiple?: false }
  ): Promise<FileSystemFileHandle[]>;
}

export interface ShowSaveFilePicker {
  (options: FilePickerOptions): Promise<FileSystemFileHandle>;
}
