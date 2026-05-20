import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { templates } from "@src/data/templates";
import * as flodeskFile from "@src/pages/Editor/exporter/flodeskFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";
import { Templates } from "@src/pages/Templates/Templates";

import { renderAtPath } from "./test-utils";

afterEach(() => {
  vi.restoreAllMocks();
});

const renderTemplatesAt = (initialPath = "/templates") =>
  renderAtPath(<Templates />, "/templates", initialPath);

const getMobileSelectTrigger = (): HTMLButtonElement => {
  const trigger = document.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="listbox"]'
  );
  if (!trigger) throw new Error("Select trigger not found");
  return trigger;
};

const openMobileSelect = async () => {
  const user = userEvent.setup();
  await user.click(getMobileSelectTrigger());
  await waitFor(() =>
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0)
  );
  return user;
};

describe("Templates page — category list", () => {
  it("renders every category from the data file in the sidebar nav", () => {
    renderTemplatesAt();
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });
    for (const category of categories) {
      expect(
        within(sidebar).getByRole("link", { name: category.label })
      ).toBeInTheDocument();
    }
  });

  it("renders sidebar category links with the right href", () => {
    renderTemplatesAt();
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });

    expect(
      within(sidebar).getByRole("link", { name: /browse all/i })
    ).toHaveAttribute("href", "/templates");

    for (const category of categories) {
      if (category.id === ALL_CATEGORY_ID) continue;
      expect(
        within(sidebar).getByRole("link", { name: category.label })
      ).toHaveAttribute("href", `/templates?category=${category.id}`);
    }
  });

  it("marks the active category with aria-current=page", () => {
    renderTemplatesAt("/templates?category=welcome");
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });

    expect(
      within(sidebar).getByRole("link", { name: /welcome/i })
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(sidebar).getByRole("link", { name: /browse all/i })
    ).not.toHaveAttribute("aria-current");
  });

  it('shows a "Start from scratch" entry at the bottom that links to /editor', () => {
    renderTemplatesAt();
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });
    const scratch = within(sidebar).getByRole("link", {
      name: /start from scratch/i,
    });
    expect(scratch).toHaveAttribute("href", "/editor");

    // It is rendered after every category link.
    const links = within(sidebar).getAllByRole("link");
    expect(links[links.length - 1]).toBe(scratch);
  });

  it('shows an "Open from file" action at the very bottom of the sidebar', () => {
    renderTemplatesAt();
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });
    const openBtn = within(sidebar).getByRole("button", {
      name: /open from file/i,
    });
    expect(openBtn).toBeInTheDocument();

    // It is the last interactive element in the sidebar nav, below both the
    // category links and the "Start from scratch" link.
    const interactive = within(sidebar)
      .getByRole("navigation", { name: /template categories/i })
      .querySelectorAll<HTMLElement>("a, button");
    expect(interactive[interactive.length - 1]).toBe(openBtn);
  });

  it("invokes openFlodeskFile and navigates to /editor when 'Open from file' is clicked", async () => {
    const user = userEvent.setup();
    const openSpy = vi
      .spyOn(flodeskFile, "openFlodeskFile")
      .mockResolvedValue({ name: "saved-draft", page: createEmptyPage() });

    renderTemplatesAt();
    await user.click(screen.getByRole("button", { name: /open from file/i }));

    await waitFor(() => expect(openSpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/editor")
    );
  });

  it("surfaces an error when openFlodeskFile throws", async () => {
    const user = userEvent.setup();
    vi.spyOn(flodeskFile, "openFlodeskFile").mockRejectedValue(
      new Error("File is not a Flodesk draft.")
    );

    renderTemplatesAt();
    await user.click(screen.getByRole("button", { name: /open from file/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "File is not a Flodesk draft."
      )
    );
    // No navigation when open fails.
    expect(screen.getByTestId("location")).toHaveTextContent("/templates");
  });

  it("surfaces mobile file-open errors through the shared toast", async () => {
    vi.spyOn(flodeskFile, "openFlodeskFile").mockRejectedValue(
      new Error("Mobile file could not be opened.")
    );

    renderTemplatesAt();
    const user = await openMobileSelect();
    await user.click(screen.getByRole("option", { name: /open from file/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Mobile file could not be opened."
      )
    );
    expect(screen.getByTestId("location")).toHaveTextContent("/templates");
  });
});

describe("Templates page — template grid filtering", () => {
  it("renders every template title on /templates (no category filter)", () => {
    renderTemplatesAt();
    for (const t of templates) {
      expect(
        screen.getByRole("heading", { level: 3, name: t.title })
      ).toBeInTheDocument();
    }
    expect(
      screen.getAllByRole("link", { name: /^view details/i })
    ).toHaveLength(templates.length);
  });

  it("filters the grid to one template when the welcome category is selected", () => {
    renderTemplatesAt("/templates?category=welcome");
    const cards = screen.getAllByRole("link", { name: /^view details/i });
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveAttribute(
      "href",
      "/templates/welcome-to-the-family"
    );
    expect(
      screen.getByRole("heading", { level: 3, name: /welcome to the family/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: /bold sale/i })
    ).not.toBeInTheDocument();
  });

  it.each(
    categories
      .filter((c) => c.id !== ALL_CATEGORY_ID)
      .map((c) => [c.id, c.label] as const)
  )("filters the grid to only templates matching category %s", (id, label) => {
    renderTemplatesAt(`/templates?category=${id}`);
    const expected = templates.filter((t) => t.categoryId === id);
    expect(
      screen.getAllByRole("link", { name: /^view details/i })
    ).toHaveLength(expected.length);
    expect(expected.length).toBeGreaterThan(0); // sanity check the fixture

    for (const t of expected) {
      expect(
        screen.getByRole("heading", { level: 3, name: t.title })
      ).toBeInTheDocument();
    }
    expect(label.length).toBeGreaterThan(0);
  });

  it("falls back to showing all templates when ?category= is unknown", () => {
    renderTemplatesAt("/templates?category=does-not-exist");
    expect(
      screen.getAllByRole("link", { name: /^view details/i })
    ).toHaveLength(templates.length);
  });

  it("navigates to /editor when the Start from scratch link is clicked", async () => {
    const user = userEvent.setup();
    renderTemplatesAt();
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });
    await user.click(
      within(sidebar).getByRole("link", { name: /start from scratch/i })
    );
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/editor")
    );
  });

  it("navigates to /templates/:id when a View details link is clicked", async () => {
    const user = userEvent.setup();
    renderTemplatesAt();
    const bold = templates.find((t) => t.id === "bold-sale-announcement")!;
    await user.click(
      screen.getByRole("link", { name: `View details: ${bold.title}` })
    );
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/templates/bold-sale-announcement"
      )
    );
  });

  it("navigates to /templates?category=X when a sidebar category is clicked", async () => {
    const user = userEvent.setup();
    renderTemplatesAt();
    const sidebar = screen.getByRole("complementary", {
      name: /template categories/i,
    });
    await user.click(within(sidebar).getByRole("link", { name: /inspire/i }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/templates?category=inspire"
      )
    );
  });
});
