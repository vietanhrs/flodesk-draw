import { Text } from "@flodesk/grain";
import { Link } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { FlodeskLogo } from "@src/shared";

interface SidebarProps {
  activeCategoryId: string;
}

export const Sidebar = ({ activeCategoryId }: SidebarProps) => {
  return (
    <aside
      aria-label="Template categories"
      className="hidden xl:flex flex-col gap-15 pt-10 px-7 2xl:pl-10 2xl:pr-6 pl-5 pr-3 bg-background"
    >
      <FlodeskLogo />

      <div className="flex flex-col gap-10 2xl:ml-34 2xl:mr-20 ml-17 mr-10">
        <Text
          size="xl"
          weight="medium"
          className="font-flodesk text-shade13 leading-tight m-0 mt-3"
        >
          What's your goal?
        </Text>
        <nav>
          <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
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
                    className={[
                      "font-flodesk block text-body no-underline transition-colors",
                      isActive
                        ? "text-shade13 font-medium"
                        : "text-content2 font-normal hover:text-shade13",
                    ].join(" ")}
                  >
                    {category.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};
