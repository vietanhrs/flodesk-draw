import { GrainProvider } from "@flodesk/grain";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { appRoutes } from "@src/routes";

const renderAppRoute = (initialPath: string) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: [initialPath],
  });

  return render(
    <GrainProvider breakpoints={{ mobile: 768, tablet: 1280 }}>
      <RouterProvider router={router} />
    </GrainProvider>
  );
};

describe("app routes", () => {
  it("renders the ErrorBoundary fallback for unmatched routes", async () => {
    renderAppRoute("/missing-route");

    expect(
      await screen.findByRole("heading", { name: "Oops!" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "go back home" })).toHaveAttribute(
      "href",
      "/"
    );
  });
});
