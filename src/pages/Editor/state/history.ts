import type { PageData } from "./types";

export interface HistoryStack {
  past: PageData[];
  present: PageData;
  future: PageData[];
}

interface CommitHistoryOptions {
  debounceKey?: string;
  lastCommitKey: string | null;
  lastCommitAt: number;
}

export const DEBOUNCE_MERGE_MS = 600;

const HISTORY_LIMIT = 100;
const LARGE_PAGE_HISTORY_LIMIT = 25;
const LARGE_PAGE_HISTORY_THRESHOLD_BYTES = 120_000;

const estimatePageBytes = (page: PageData): number =>
  JSON.stringify(page).length;

const historyLimitForPage = (page: PageData): number =>
  estimatePageBytes(page) > LARGE_PAGE_HISTORY_THRESHOLD_BYTES
    ? LARGE_PAGE_HISTORY_LIMIT
    : HISTORY_LIMIT;

export const commitHistory = (
  history: HistoryStack,
  nextPage: PageData,
  { debounceKey, lastCommitKey, lastCommitAt }: CommitHistoryOptions
) => {
  const now = Date.now();
  const same =
    debounceKey &&
    debounceKey === lastCommitKey &&
    now - lastCommitAt < DEBOUNCE_MERGE_MS;
  const historyLimit = historyLimitForPage(nextPage);
  const past = same
    ? history.past.slice(-historyLimit)
    : [...history.past, history.present].slice(-historyLimit);

  return {
    history: {
      past,
      present: nextPage,
      future: [],
    },
    lastCommitKey: debounceKey ?? null,
    lastCommitAt: now,
  };
};

export const undoHistory = (history: HistoryStack): HistoryStack | null => {
  if (history.past.length === 0) return null;
  const prev = history.past[history.past.length - 1];
  const historyLimit = historyLimitForPage(prev);

  return {
    past: history.past.slice(0, -1),
    present: prev,
    future: [history.present, ...history.future].slice(0, historyLimit),
  };
};

export const redoHistory = (history: HistoryStack): HistoryStack | null => {
  if (history.future.length === 0) return null;
  const [next, ...rest] = history.future;
  const historyLimit = historyLimitForPage(next);

  return {
    past: [...history.past, history.present].slice(-historyLimit),
    present: next,
    future: rest,
  };
};
