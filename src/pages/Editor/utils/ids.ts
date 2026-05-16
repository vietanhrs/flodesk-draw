let counter = 0;

export const createId = (prefix: string): string => {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
};
