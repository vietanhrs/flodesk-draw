import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { MobileHeader } from "@src/pages/Templates/components/MobileHeader";

import { renderAtPath } from "./test-utils";

const renderMobile = (
  activeCategoryId: string = ALL_CATEGORY_ID,
  initialPath: string = "/templates",
  onOpenFromFile: () => Promise<void> = vi.fn()
) =>
  renderAtPath(
    <MobileHeader
      activeCategoryId={activeCategoryId}
      onOpenFromFile={onOpenFromFile}
    />,
    "/templates",
    initialPath
  );

// Grain's Select puts its aria-label on the Listbox wrapper, not the trigger
// button. We look up the trigger via its headless-ui listbox haspopup contract,
// which is stable across renders.
const getSelectTrigger = (): HTMLButtonElement => {
  const trigger = document.querySelector<HTMLButtonElement>(
    'button[aria-haspopup="listbox"]'
  );
  if (!trigger) throw new Error("Select trigger not found");
  return trigger;
};

const openSelect = async () => {
  const user = userEvent.setup();
  await user.click(getSelectTrigger());
  await waitFor(() =>
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0)
  );
  return user;
};

describe("MobileHeader", () => {
  it("renders the heading and a category filter select", () => {
    renderMobile();
    expect(
      screen.getByRole("heading", { level: 2, name: /what's your goal/i })
    ).toBeInTheDocument();
    const trigger = getSelectTrigger();
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("reflects the active category in the Select trigger", () => {
    renderMobile("welcome");
    expect(getSelectTrigger()).toHaveTextContent(/welcome/i);
  });

  it("lists every category plus a Start from scratch option once opened", async () => {
    renderMobile();
    await openSelect();
    for (const category of categories) {
      expect(
        screen.getByRole("option", { name: category.label })
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole("option", { name: /start from scratch/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /open from file/i })
    ).toBeInTheDocument();
  });

  it("navigates to /templates when Browse all is picked", async () => {
    renderMobile("welcome", "/templates?category=welcome");
    const user = await openSelect();
    await user.click(screen.getByRole("option", { name: /browse all/i }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/templates$/)
    );
  });

  it("navigates to /templates?category=:id when a real category is picked", async () => {
    renderMobile();
    const user = await openSelect();
    await user.click(screen.getByRole("option", { name: /^make money$/i }));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/templates?category=make-money"
      )
    );
  });

  it("navigates to /editor when Start from scratch is picked", async () => {
    renderMobile();
    const user = await openSelect();
    await user.click(
      screen.getByRole("option", { name: /start from scratch/i })
    );
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(/^\/editor$/)
    );
  });

  it("invokes the file-open handler when Open from file is picked", async () => {
    const onOpenFromFile = vi.fn().mockResolvedValue(undefined);
    renderMobile(ALL_CATEGORY_ID, "/templates", onOpenFromFile);
    const user = await openSelect();

    await user.click(screen.getByRole("option", { name: /open from file/i }));

    await waitFor(() => expect(onOpenFromFile).toHaveBeenCalledTimes(1));
  });
});
