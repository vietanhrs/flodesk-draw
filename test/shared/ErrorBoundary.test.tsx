import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "@src/shared/ErrorBoundary";

const Boom = ({ message = "test failure" }: { message?: string }) => {
  throw new Error(message);
};

beforeEach(() => {
  // React logs caught render errors via console.error. Silence just that during
  // these tests — anything else still surfaces.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

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
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole("heading", { name: "Oops!" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "refresh" })).toBeInTheDocument();
  });

  it("renders a custom fallback when provided, passing the error and retry", () => {
    const fallback = vi.fn((error: Error | null) => (
      <p>custom: {error?.message}</p>
    ));

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

  it("clears the error state when the refresh link is clicked", async () => {
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
    await user.click(screen.getByRole("link", { name: "refresh" }));

    expect(screen.getByText("recovered")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Oops!" })
    ).not.toBeInTheDocument();
  });
});
