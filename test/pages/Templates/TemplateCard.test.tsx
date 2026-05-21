import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { getCategoryLabel } from "@src/data/categories";
import { templates } from "@src/data/templates";
import { TemplateCard } from "@src/pages/Templates/components/TemplateCard";

import { renderAtPath } from "./test-utils";

const sample = templates.find((t) => t.id === "welcome-to-the-family")!;

describe("TemplateCard", () => {
  it("renders the template title and category label", () => {
    renderAtPath(<TemplateCard template={sample} />, "/templates");
    expect(
      screen.getByRole("heading", { level: 3, name: sample.title })
    ).toBeInTheDocument();
    expect(
      screen.getByText(getCategoryLabel(sample.categoryId))
    ).toBeInTheDocument();
  });

  it("renders the preview iframe but keeps it inert", () => {
    renderAtPath(<TemplateCard template={sample} />, "/templates");
    const iframe = screen.getByTitle(`${sample.title} preview`);
    expect(iframe).toHaveAttribute("aria-hidden", "true");
    expect(iframe).toHaveAttribute("tabindex", "-1");
    expect(iframe).toHaveAttribute("loading", "lazy");
    expect(iframe).toHaveAttribute("sandbox", "");
  });

  it('exposes a "Open template" overlay link with the right href and aria-label', () => {
    renderAtPath(<TemplateCard template={sample} />, "/templates");
    const link = screen.getByRole("link", {
      name: `Open template: ${sample.title}`,
    });
    expect(link).toHaveAttribute("href", `/templates/${sample.id}`);
    // The dim/backdrop + button visibility are CSS-driven on .tpl-card:hover;
    // the link itself is part of the DOM at all times so it stays focusable.
    expect(link).toHaveClass("tpl-card__overlay");
    expect(link.closest("article")).toHaveClass("tpl-card");
  });

  it("keeps the Open template link reachable after hovering the card", async () => {
    const user = userEvent.setup();
    renderAtPath(<TemplateCard template={sample} />, "/templates");
    const article = screen
      .getByRole("link", {
        name: `Open template: ${sample.title}`,
      })
      .closest("article")!;
    await user.hover(article);
    expect(
      screen.getByRole("link", { name: `Open template: ${sample.title}` })
    ).toBeInTheDocument();
  });

  it("navigates to /templates/:templateId when Open template is clicked", async () => {
    const user = userEvent.setup();
    renderAtPath(<TemplateCard template={sample} />, "/templates");
    await user.click(
      screen.getByRole("link", { name: `Open template: ${sample.title}` })
    );
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        `/templates/${sample.id}`
      )
    );
  });
});
