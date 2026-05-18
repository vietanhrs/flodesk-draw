import type { ElementHandler } from "./base";
import { buttonHandler } from "./button";
import { dividerHandler } from "./divider";
import { headingHandler } from "./heading";
import { imageHandler } from "./image";
import { paragraphHandler } from "./paragraph";
import { quoteHandler } from "./quote";
import { socialHandler } from "./social";
import { spacerHandler } from "./spacer";
import { videoHandler } from "./video";

export const handlers = [
  headingHandler,
  paragraphHandler,
  quoteHandler,
  imageHandler,
  videoHandler,
  buttonHandler,
  dividerHandler,
  spacerHandler,
  socialHandler,
] as const;

type HandlerElement<H> = H extends ElementHandler<infer E> ? E : never;
export type PageElement = HandlerElement<(typeof handlers)[number]>;
export type ElementType = PageElement["type"];

type HandlerFor<K extends ElementType> = Extract<
  (typeof handlers)[number],
  { type: K }
>;

export const registry = Object.fromEntries(
  handlers.map((h) => [h.type, h])
) as { [K in ElementType]: HandlerFor<K> };
