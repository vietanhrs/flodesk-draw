export const FLODESK_FILE_VERSION = 1;
export const FLODESK_EXTENSION = ".flodesk";
export const FLODESK_MIME = "application/json";

export const MAX_FLODESK_FILE_BYTES = 1_000_000;

export const flodeskTypes = [
  {
    description: "Flodesk draft",
    accept: { [FLODESK_MIME]: [FLODESK_EXTENSION] },
  },
];
