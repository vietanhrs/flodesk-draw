export const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const escapeAttr = escapeHtml;

export const styleString = (
  rules: Record<string, string | number | undefined>
): string => {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(rules)) {
    if (value === undefined || value === null || value === "") continue;
    const css = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    parts.push(`${css}:${value}`);
  }
  return parts.join(";");
};
