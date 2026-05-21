import { Stack, Text } from "@flodesk/grain";
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
    <Stack tag="article" gap="l" className="tpl-card">
      <div className="tpl-card__preview">
        <iframe
          title={`${template.title} preview`}
          srcDoc={template.html}
          aria-hidden="true"
          tabIndex={-1}
          loading="lazy"
          sandbox=""
          className="tpl-card__iframe"
          style={{
            width: `${TEMPLATE_PREVIEW_WIDTH}px`,
            height: `${TEMPLATE_PREVIEW_HEIGHT}px`,
            transform: `scale(calc(100cqw / ${TEMPLATE_PREVIEW_WIDTH}px))`,
          }}
        />
        <Link
          to={`/templates/${template.id}`}
          className="tpl-card__overlay"
          aria-label={`Open template: ${template.title}`}
        >
          <span className="tpl-card__button">View details</span>
        </Link>
      </div>

      <Stack gap="xs">
        <Text
          tag="p"
          size="s"
          color="content2"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {getCategoryLabel(template.categoryId)}
        </Text>
        <Text tag="h3" size="l" weight="medium" color="shade13">
          {template.title}
        </Text>
      </Stack>
    </Stack>
  );
};
