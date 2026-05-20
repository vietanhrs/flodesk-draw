import { GrainProvider } from "@flodesk/grain";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NumberField } from "@src/pages/Editor/components/ConfigPane/controls/NumberField";

const renderNumberField = (
  props?: Partial<Parameters<typeof NumberField>[0]>
) => {
  const onChange = vi.fn();
  render(
    <GrainProvider>
      <NumberField
        label="Padding"
        value={24}
        min={0}
        max={40}
        step={4}
        onChange={onChange}
        {...props}
      />
    </GrainProvider>
  );
  return { onChange };
};

describe("NumberField", () => {
  it("live-commits in-range typed values", () => {
    const { onChange } = renderNumberField();

    fireEvent.change(screen.getByLabelText("Padding"), {
      target: { value: "32" },
    });

    expect(onChange).toHaveBeenCalledWith(32);
  });

  it("keeps out-of-range typed values local until blur clamps them", () => {
    const { onChange } = renderNumberField();
    const input = screen.getByLabelText("Padding");

    fireEvent.change(input, { target: { value: "999" } });

    expect(input).toHaveValue(999);
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(40);
  });

  it("nudges by step and clamps at the configured bounds", async () => {
    const user = userEvent.setup();
    const { onChange } = renderNumberField({ value: 4 });

    await user.click(screen.getByLabelText("Decrease Padding"));
    await user.click(screen.getByLabelText("Increase Padding"));

    expect(onChange).toHaveBeenNthCalledWith(1, 0);
    expect(onChange).toHaveBeenNthCalledWith(2, 8);
  });
});
