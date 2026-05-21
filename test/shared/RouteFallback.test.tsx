import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { RouteFallback } from "@src/shared";

describe("RouteFallback", () => {
  it("renders a loading landmark with the shared logo link", () => {
    render(
      <MemoryRouter>
        <RouteFallback />
      </MemoryRouter>
    );

    expect(screen.getByRole("main", { name: "Loading page" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
  });
});
