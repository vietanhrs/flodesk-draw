import { Text } from "@flodesk/grain";
import { Link } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { FlodeskLogo } from "@src/shared";

interface SidebarProps {
  activeCategoryId: string;
}

export const Sidebar = ({ activeCategoryId }: SidebarProps) => {
  return (
    <aside aria-label="Template categories" className="tpl-sidebar">
      <FlodeskLogo />

      <div className="tpl-sidebar__inner">
        <Text size="xl" weight="medium" className="tpl-sidebar__heading">
          What's your goal?
        </Text>
        <nav className="tpl-sidebar__nav">
          <ul className="tpl-sidebar__list">
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId;
              const to =
                category.id === ALL_CATEGORY_ID
                  ? "/templates"
                  : `/templates?category=${category.id}`;
              return (
                <li key={category.id}>
                  <Link
                    to={to}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      "tpl-sidebar__link" +
                      (isActive ? " tpl-sidebar__link--active" : "")
                    }
                  >
                    {category.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link to="/editor" className="tpl-sidebar__link">
                Start from scratch
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};
