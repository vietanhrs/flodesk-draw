import { Link } from "react-router-dom";

import { getCategoryLabel } from "@src/data/categories";
import type { Template } from "@src/data/templates";
import {
  TEMPLATE_PREVIEW_HEIGHT,
  TEMPLATE_PREVIEW_WIDTH,
} from "@src/data/templates";

interface TemplateCardProps {
  template: Template;
}

export const TemplateCard = ({ template }: TemplateCardProps) => {
  return (
    <article className="tpl-card">
      <div className="tpl-card__preview">
        <iframe
          title={`${template.title} preview`}
          srcDoc={template.html}
          aria-hidden="true"
          tabIndex={-1}
          className="tpl-card__iframe"
          style={{
            width: `${TEMPLATE_PREVIEW_WIDTH}px`,
            height: `${TEMPLATE_PREVIEW_HEIGHT}px`,
            transform: `scale(calc(100cqw / ${TEMPLATE_PREVIEW_WIDTH}))`,
          }}
        />
        <Link
          to={`/templates/${template.id}`}
          className="tpl-card__overlay"
          aria-label={`View details: ${template.title}`}
        >
          <span className="tpl-card__button">View details</span>
        </Link>
      </div>

      <div className="tpl-card__meta">
        <p className="tpl-card__category">
          {getCategoryLabel(template.categoryId)}
        </p>
        <h3 className="tpl-card__title">{template.title}</h3>
      </div>
    </article>
  );
};
