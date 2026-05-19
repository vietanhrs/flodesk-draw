import type { ComponentType, SVGProps } from "react";

import { IconButton, Stack } from "@flodesk/grain";

export interface FloatingMenuAction {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

interface Props {
  ariaLabel: string;
  actions: FloatingMenuAction[];
  className?: string;
}

export const FloatingMenu = ({ ariaLabel, actions, className }: Props) => (
  <Stack
    padding={0.5}
    role="toolbar"
    aria-label={ariaLabel}
    className={"edt-floating-menu" + (className ? " " + className : "")}
    onMouseDown={(e) => e.stopPropagation()}
  >
    {actions.map((action) => {
      const Icon = action.icon;
      return (
        <IconButton
          style={{ width: 36, height: 36 }}
          variant={action.danger ? "danger" : "neutral"}
          icon={<Icon width={20} height={20} />}
          key={action.label}
          type="button"
          title={action.label}
          aria-label={action.label}
          isDisabled={action.disabled}
          onClick={(e) => {
            // The element wrapper that hosts this menu has its own onClick
            // that would re-select the original element; stop the click here
            // so the action's own selection effect (move/duplicate select the
            // moved/cloned element) wins.
            e.stopPropagation();
            action.onClick();
          }}
          className={action.danger ? "edt-floating-menu__danger" : undefined}
        />
      );
    })}
  </Stack>
);
