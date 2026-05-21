import { describe, expect, it, vi } from "vitest";

import {
  commitHistory,
  DEBOUNCE_MERGE_MS,
  redoHistory,
  undoHistory,
} from "@src/pages/Editor/state/history";
import type { PageData } from "@src/pages/Editor/state/types";

const createPage = (title: string, extraText = ""): PageData => ({
  title,
  backgroundColor: "#ffffff",
  paddingX: 24,
  paddingY: 24,
  rows: [
    {
      id: `row-${title}`,
      backgroundColor: "transparent",
      paddingX: 0,
      paddingY: 0,
      marginY: 0,
      columnsCount: 1,
      columnWidths: [1],
      columnGap: 24,
      columns: [
        [
          {
            id: `el-${title}`,
            type: "paragraph",
            text: `${title}${extraText}`,
            fontSize: 16,
            lineHeight: 1.6,
            align: "left",
            color: "#111111",
          },
        ],
      ],
    },
  ],
});

describe("history helpers", () => {
  it("merges commits when the debounce key matches within the merge window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-21T10:00:00Z"));

    const initial = createPage("Initial");
    const first = createPage("First");
    const second = createPage("Second");

    const firstCommit = commitHistory(
      { past: [], present: initial, future: [] },
      first,
      { debounceKey: "title", lastCommitKey: null, lastCommitAt: 0 }
    );

    vi.advanceTimersByTime(DEBOUNCE_MERGE_MS - 50);

    const merged = commitHistory(firstCommit.history, second, {
      debounceKey: "title",
      lastCommitKey: firstCommit.lastCommitKey,
      lastCommitAt: firstCommit.lastCommitAt,
    });

    expect(firstCommit.history.past).toHaveLength(1);
    expect(merged.history.past).toHaveLength(1);
    expect(merged.history.past[0].title).toBe("Initial");
    expect(merged.history.present.title).toBe("Second");

    vi.useRealTimers();
  });

  it("creates a new history entry when the debounce key changes or expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-21T10:00:00Z"));

    const initial = createPage("Initial");
    const first = createPage("First");
    const second = createPage("Second");

    const firstCommit = commitHistory(
      { past: [], present: initial, future: [] },
      first,
      { debounceKey: "title", lastCommitKey: null, lastCommitAt: 0 }
    );

    vi.advanceTimersByTime(DEBOUNCE_MERGE_MS + 1);

    const nextCommit = commitHistory(firstCommit.history, second, {
      debounceKey: "title",
      lastCommitKey: firstCommit.lastCommitKey,
      lastCommitAt: firstCommit.lastCommitAt,
    });

    expect(nextCommit.history.past).toHaveLength(2);
    expect(nextCommit.history.past[1].title).toBe("First");

    vi.useRealTimers();
  });

  it("uses the reduced history cap for large pages", () => {
    const base = createPage("Base");
    let history = { past: [] as PageData[], present: base, future: [] as PageData[] };
    let lastCommitKey: string | null = null;
    let lastCommitAt = 0;

    for (let index = 0; index < 40; index += 1) {
      const nextPage = createPage(`Large-${index}`, "x".repeat(130_000));
      const result = commitHistory(history, nextPage, {
        debounceKey: `page-${index}`,
        lastCommitKey,
        lastCommitAt,
      });
      history = result.history;
      lastCommitKey = result.lastCommitKey;
      lastCommitAt = result.lastCommitAt;
    }

    expect(history.past).toHaveLength(25);
    expect(history.past[0].title).toBe("Large-14");
    expect(history.present.title).toBe("Large-39");
  });

  it("undo and redo preserve the expected present page", () => {
    const initial = createPage("Initial");
    const first = createPage("First");
    const second = createPage("Second");

    const history = {
      past: [initial, first],
      present: second,
      future: [],
    };

    const undone = undoHistory(history);
    expect(undone?.present.title).toBe("First");
    expect(undone?.future[0].title).toBe("Second");

    const redone = undone ? redoHistory(undone) : null;
    expect(redone?.present.title).toBe("Second");
    expect(redone?.past[redone.past.length - 1].title).toBe("First");
  });
});
