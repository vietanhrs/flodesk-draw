export const computeInsertIndex = (
  column: HTMLElement,
  clientY: number
): number => {
  const items = column.querySelectorAll<HTMLElement>("[data-element-index]");
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (clientY < midY) return i;
  }
  return items.length;
};

export const isKeyboardActivation = (key: string): boolean =>
  key === "Enter" || key === " ";

export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};
