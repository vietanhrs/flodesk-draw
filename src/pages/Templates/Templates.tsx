import { useMemo } from "react";

import { useSearchParams } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { templates } from "@src/data/templates";

import { MobileHeader } from "./components/MobileHeader";
import { Sidebar } from "./components/Sidebar";
import { TemplateCard } from "./components/TemplateCard";

export const Templates = () => {
  const [searchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category") ?? ALL_CATEGORY_ID;
  const activeCategoryId = useMemo(() => {
    const known = categories.some((c) => c.id === requestedCategory);
    return known ? requestedCategory : ALL_CATEGORY_ID;
  }, [requestedCategory]);

  const visibleTemplates = useMemo(() => {
    if (activeCategoryId === ALL_CATEGORY_ID) return templates;
    return templates.filter((t) => t.categoryId === activeCategoryId);
  }, [activeCategoryId]);

  return (
    <main className="min-h-screen xl:bg-background2 flex flex-col xl:flex-row xl:gap-26 pb-20 p-4 xl:p-0">
      <Sidebar activeCategoryId={activeCategoryId} />

      <section
        aria-label="Templates"
        className="flex-1 min-w-0 xl:pt-34 2xl:max-w-230"
      >
        <MobileHeader activeCategoryId={activeCategoryId} />

        {visibleTemplates.length === 0 ? (
          <p className="text-content2 text-body mt-10">
            No templates in this category yet.
          </p>
        ) : (
          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-content gap-x-18 gap-y-15 list-none p-0 m-0"
          >
            {visibleTemplates.map((template) => (
              <li key={template.id}>
                <TemplateCard template={template} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};
