import { Stack, Text } from "@flodesk/grain";
import { Link } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { FlodeskLogo } from "@src/shared";

interface SidebarProps {
  activeCategoryId: string;
  onOpenFromFile: () => Promise<void>;
}

export const Sidebar = ({ activeCategoryId, onOpenFromFile }: SidebarProps) => {
  return (
    <aside aria-label="Template categories" className="tpl-sidebar">
      <FlodeskLogo />

      <Stack gap="xl" className="tpl-sidebar__inner">
        <Text
          tag="h2"
          size="xl"
          weight="medium"
          color="shade13"
          className="tpl-sidebar__heading"
        >
          What's your goal?
        </Text>
        <Stack tag="nav" gap="s" aria-label="Template categories">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;
            const to =
              category.id === ALL_CATEGORY_ID
                ? "/templates"
                : `/templates?category=${category.id}`;
            return (
              <Link
                key={category.id}
                to={to}
                aria-current={isActive ? "page" : undefined}
                className={
                  "tpl-sidebar__link" +
                  (isActive ? " tpl-sidebar__link--active" : "")
                }
              >
                {category.label}
              </Link>
            );
          })}
          <Link to="/editor" className="tpl-sidebar__link">
            Start from scratch
          </Link>
          <button
            type="button"
            onClick={() => {
              void onOpenFromFile();
            }}
            className="tpl-sidebar__link tpl-sidebar__link--action"
          >
            Open from file
          </button>
        </Stack>
      </Stack>
    </aside>
  );
};
