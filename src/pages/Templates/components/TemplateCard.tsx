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
    <article className="group flex flex-col gap-6 w-full xl:w-min">
      <div className="relative rounded-card w-full xl:w-82 overflow-hidden bg-white shadow-m aspect-600/785 @container">
        <iframe
          title={`${template.title} preview`}
          srcDoc={template.html}
          aria-hidden="true"
          tabIndex={-1}
          className="block border-0 pointer-events-none origin-top-left"
          style={{
            width: `${TEMPLATE_PREVIEW_WIDTH}px`,
            height: `${TEMPLATE_PREVIEW_HEIGHT}px`,
            transform: `scale(calc(100cqw / ${TEMPLATE_PREVIEW_WIDTH}))`,
          }}
        />
        <Link
          to={`/templates/${template.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 no-underline"
          aria-label={`View details: ${template.title}`}
        >
          <span className="font-flodesk inline-flex items-center justify-center bg-shade2 text-shade13 text-body font-medium rounded-md px-4 h-10 border border-border">
            View details
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-1.5 font-flodesk">
        <p className="text-content2 text-xs uppercase tracking-caps m-0">
          {getCategoryLabel(template.categoryId)}
        </p>
        <h3 className="text-shade13 text-lg font-medium m-0 leading-snug">
          {template.title}
        </h3>
      </div>
    </article>
  );
};
