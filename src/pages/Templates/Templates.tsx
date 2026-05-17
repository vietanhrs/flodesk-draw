import { useMemo } from "react";

import { Arrange, Text } from "@flodesk/grain";
import { useSearchParams } from "react-router-dom";

import { ALL_CATEGORY_ID, categories } from "@src/data/categories";
import { templates } from "@src/data/templates";

import { MobileHeader } from "./components/MobileHeader";
import { Sidebar } from "./components/Sidebar";
import { TemplateCard } from "./components/TemplateCard";
import "./templates.css";

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
    <main className="tpl-page">
      <Sidebar activeCategoryId={activeCategoryId} />

      <section aria-label="Templates" className="tpl-section">
        <MobileHeader activeCategoryId={activeCategoryId} />

        {visibleTemplates.length === 0 ? (
          <Text
            tag="p"
            size="m"
            color="content2"
            className="tpl-section__empty"
          >
            No templates in this category yet.
          </Text>
        ) : (
          <Arrange
            tag="ul"
            role="list"
            columns={{
              default: "repeat(2, min-content)",
              tablet: "repeat(2, minmax(0, 1fr))",
              mobile: "1fr",
            }}
            columnGap="72px"
            rowGap="60px"
            padding={0}
            margin={0}
            style={{ listStyle: "none" }}
          >
            {visibleTemplates.map((template) => (
              <li key={template.id}>
                <TemplateCard template={template} />
              </li>
            ))}
          </Arrange>
        )}
      </section>
    </main>
  );
};
