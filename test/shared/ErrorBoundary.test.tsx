import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "@src/shared/ErrorBoundary";

const Boom = ({ message = "test failure" }: { message?: string }) => {
  throw new Error(message);
};

/**
 * React logs caught render errors via console.error. Call this from tests that
 * intentionally throw inside an ErrorBoundary child so the captured log
 * doesn't pollute test output. Scoped per-test rather than file-wide so any
 * unexpected console.error in the non-throwing tests still surfaces.
 */
const silenceReactCaughtErrorLog = () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("renders children unchanged when no error is thrown", () => {
    render(
      <ErrorBoundary>
        <p>hello</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    silenceReactCaughtErrorLog();
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole("heading", { name: "Oops!" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "refresh" })).toBeInTheDocument();
  });

  it("renders a custom fallback when provided, passing the error and retry", () => {
    silenceReactCaughtErrorLog();
    const fallback = vi.fn<
      (error: Error | null, retry: () => void) => ReactNode
    >((error) => <p>custom: {error?.message}</p>);

    render(
      <ErrorBoundary fallback={fallback}>
        <Boom message="kaboom" />
      </ErrorBoundary>
    );

    expect(screen.getByText("custom: kaboom")).toBeInTheDocument();
    expect(fallback).toHaveBeenCalled();
    const [error, retry] = fallback.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(retry).toBeInstanceOf(Function);
  });

  it("clears the error state when the refresh button is clicked", async () => {
    silenceReactCaughtErrorLog();
    const user = userEvent.setup();
    let shouldThrow = true;
    const Toggleable = () => {
      if (shouldThrow) throw new Error("first only");
      return <p>recovered</p>;
    };

    render(
      <ErrorBoundary>
        <Toggleable />
      </ErrorBoundary>
    );

    // Fallback is showing first.
    expect(screen.getByRole("heading", { name: "Oops!" })).toBeInTheDocument();

    // Stop throwing before triggering the re-render via refresh.
    shouldThrow = false;
    await user.click(screen.getByRole("button", { name: "refresh" }));

    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Oops!" })
    ).not.toBeInTheDocument();
  });
});
