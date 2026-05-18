import type { ComponentType, SVGProps } from "react";

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
  <div
    role="toolbar"
    aria-label={ariaLabel}
    className={"edt-floating-menu" + (className ? " " + className : "")}
    onMouseDown={(e) => e.stopPropagation()}
  >
    {actions.map((action) => {
      const Icon = action.icon;
      return (
        <button
          key={action.label}
          type="button"
          title={action.label}
          aria-label={action.label}
          disabled={action.disabled}
          onClick={(e) => {
            // The element wrapper that hosts this menu has its own onClick
            // that would re-select the original element; stop the click here
            // so the action's own selection effect (move/duplicate select the
            // moved/cloned element) wins.
            e.stopPropagation();
            action.onClick();
          }}
          className={action.danger ? "edt-floating-menu__danger" : undefined}
        >
          <Icon width={16} height={16} />
        </button>
      );
    })}
  </div>
);
