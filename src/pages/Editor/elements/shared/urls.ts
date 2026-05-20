const URL_BASE = "https://flodesk.local";

const hasControlChar = (value: string): boolean => {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
};

const parseUrl = (value: string): URL | null => {
  const trimmed = value.trim();
  if (!trimmed || hasControlChar(trimmed)) return null;
  try {
    return new URL(trimmed, URL_BASE);
  } catch {
    return null;
  }
};

const hasAllowedProtocol = (
  value: string,
  allowedProtocols: readonly string[]
): boolean => {
  const url = parseUrl(value);
  return url !== null && allowedProtocols.includes(url.protocol);
};

export const isSafeLinkUrl = (value: string): boolean =>
  hasAllowedProtocol(value, ["http:", "https:", "mailto:", "tel:"]);

export const isSafeImageUrl = (value: string): boolean =>
  hasAllowedProtocol(value, ["http:", "https:"]);

export const isSafeVideoUrl = (value: string): boolean =>
  hasAllowedProtocol(value, ["https:"]);

export const safeLinkUrl = (value: string): string =>
  isSafeLinkUrl(value) ? value.trim() : "#";

export const safeImageUrl = (value: string): string =>
  isSafeImageUrl(value) ? value.trim() : "";

export const safeVideoUrl = (value: string): string =>
  isSafeVideoUrl(value) ? value.trim() : "about:blank";

export const VIDEO_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation";
