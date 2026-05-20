const hasControlChar = (value: string): boolean => {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
};

const hasExplicitScheme = (value: string): boolean =>
  /^[a-z][a-z0-9+.-]*:/i.test(value);

const parseUrl = (value: string): URL | null => {
  const trimmed = value.trim();
  if (!trimmed || hasControlChar(trimmed) || !hasExplicitScheme(trimmed)) {
    return null;
  }
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
};

const hasAbsoluteNetworkUrl = (
  value: string,
  allowedProtocols: readonly string[]
): boolean => {
  const trimmed = value.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  const url = parseUrl(value);
  return (
    url !== null &&
    allowedProtocols.includes(url.protocol) &&
    url.hostname.length > 0
  );
};

export const isSafeLinkUrl = (value: string): boolean =>
  hasAbsoluteNetworkUrl(value, ["http:", "https:"]) ||
  (() => {
    const url = parseUrl(value);
    return (
      url !== null && (url.protocol === "mailto:" || url.protocol === "tel:")
    );
  })();

export const isSafeImageUrl = (value: string): boolean =>
  hasAbsoluteNetworkUrl(value, ["http:", "https:"]);

export const isSafeVideoUrl = (value: string): boolean =>
  hasAbsoluteNetworkUrl(value, ["https:"]);

export const safeLinkUrl = (value: string): string =>
  isSafeLinkUrl(value) ? value.trim() : "#";

export const safeImageUrl = (value: string): string =>
  isSafeImageUrl(value) ? value.trim() : "";

export const safeVideoUrl = (value: string): string =>
  isSafeVideoUrl(value) ? value.trim() : "about:blank";

export const VIDEO_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation";
