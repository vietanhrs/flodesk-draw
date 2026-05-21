# flodesk-draw

A browser-based page builder where non-technical users pick a starting template, customise it block-by-block, and export the result as a static HTML document with inline styles — no toolchain required to view it. Referenced media (images, video embeds, link targets) keeps its original URLs.

Built as a take-home around Flodesk's [Grain](https://grain.flodesk.com/) design system.

## Features

- **Templates page** — browse built-in templates (sale announcement, welcome note, newsletter, thank-you note, …), filter by goal.
- **Editor** — drag-and-drop rows and elements (heading, paragraph, button, image, divider, spacer, quote, video, social), live preview, undo/redo with history merging.
- **Configuration pane** — page-, layout- (per-row), and element-level controls that reflect changes immediately on the canvas.
- **Viewport toggle** — switch the preview between desktop (1080px) and mobile (390px).
- **Export** — produce a single `.html` document with inline HTML/CSS. Images (`<img src>`), video embeds (YouTube `<iframe src>`), and link targets (button/social `href`) remain URL-referenced. Uses the File System Access API where supported, otherwise a regular blob download.
- **Draft files** — open and save `.flodesk` draft files. Chromium can save back to the opened file via the File System Access API; other browsers fall back to downloads.

## Prerequisites

- [Bun](https://bun.sh) `1.3.10` — version pinned in [`.bun-version`](./.bun-version). Install via the official installer or any version manager (`proto`, `asdf`, `mise`) that reads `.bun-version`.
- A modern browser (Chromium / Firefox / Safari current releases). The File System Access API enhances export but isn't required — the fallback download works everywhere.

> Bun handles installs and script execution; tests themselves run on Vitest. No separate Node install is needed.

## Setup

```bash
git clone git@github.com:vietanhrs/flodesk-draw.git
cd flodesk-draw

bun install            # or `bun install --frozen-lockfile` to match CI exactly
```

## Scripts

| Command                    | What it does                                                                           |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `bun run dev`              | Start the Vite dev server (HMR) at `http://localhost:5173`.                            |
| `bun run build`            | Type-check (`tsc -b`) and produce a production build in `dist/`.                       |
| `bun run build:analyze`    | Build with `ANALYZE_BUNDLE=1` and emit `dist/bundle-analysis.json`.                    |
| `bun run bundle:check`     | Build with bundle analysis and enforce per-chunk and total JS/CSS budgets.             |
| `bun run preview`          | Build and serve the production bundle locally through Wrangler.                        |
| `bun run lint`             | Run ESLint over the source tree.                                                       |
| `bun run format:check`     | Check Prettier formatting without writing changes.                                     |
| `bun run test`             | Run Vitest in watch mode. Append `--run` for a single pass.                            |
| `bun run test:e2e`         | Run the Playwright end-to-end suite.                                                   |
| `bun run test:perf`        | Build and run Playwright performance budget checks against the production preview.     |
| `bun run lighthouse:check` | Build and run Lighthouse quality gates for performance, a11y, best practices, and SEO. |
| `bun run coverage`         | Run the test suite once with v8 coverage thresholds; report written to `coverage/`.    |
| `bun run deploy`           | Build and deploy with Wrangler.                                                        |

## Project layout

```
flodesk-draw/
├── .github/
│   └── workflows/ci.yml             GitHub Actions: format, lint, coverage, bundle, Lighthouse, perf, e2e
├── .bun-version                     Pinned Bun version
├── .prettierrc.json                 Prettier config
├── index.html                       Vite entry
├── package.json / bun.lock          Scripts and pinned dependency graph
├── vite.config.ts                   Vite + Vitest config (jsdom env, path aliases)
├── playwright.config.ts             Playwright e2e config
├── eslint.config.js                 ESLint flat config (TS, React Hooks, import order)
├── tsconfig.{json,app,node}.json    TypeScript project references
├── wrangler.jsonc                   Cloudflare/Wrangler local preview + deploy config
│
├── public/
│   ├── favicon.svg
│   ├── llms.txt / robots.txt
│   └── fonts/                       Flodesk font assets served as-is
│
├── src/
│   ├── main.tsx                     React 19 root + GrainProvider
│   ├── App.tsx                      Router shell
│   ├── routes.tsx                   Route table (lazy-loaded pages)
│   ├── index.css / App.css          Global resets and Grain CSS variables
│   │
│   ├── data/                        Static catalogues (template metadata, category labels)
│   ├── shared/                      Cross-page primitives (logo, error boundary, suspense route)
│   └── pages/
│       ├── Templates/
│       │   ├── Templates.tsx        Template gallery shell
│       │   ├── templates.css        Template gallery styles
│       │   └── components/          Sidebar, mobile header, template cards
│       └── Editor/
│           ├── Editor.tsx           Shell composition (header + body + modals)
│           ├── editor.css           Editor layout and canvas styles
│           ├── components/
│           │   ├── Canvas/          Paper, rows, drop zones, floating row menu
│           │   ├── ConfigPane/      Page / Layout / Element tabs
│           │   │   └── controls/    Shared text, number, color, segmented controls
│           │   ├── ElementMenu/     Draggable element palette with category + search
│           │   ├── Header/          Title, history, viewport toggle, build button
│           │   └── BuildModal.tsx   Export progress + status dialog
│           ├── elements/            Element registry, renderers, forms, validators, HTML exporters
│           │   ├── button/ divider/ heading/ image/ paragraph/
│           │   ├── quote/ social/ spacer/ video/
│           │   └── shared/          Element-level shared helpers
│           ├── exporter/            Page → static HTML + file import/export orchestration
│           │   └── file/            `.flodesk` parse, validation, and browser file access
│           ├── state/               Zustand store, actions/mutations, history, types, templates
│           │   └── templates/       Built-in editor templates
│           └── utils/               Drag dataTransfer helpers, id generator
│
└── test/
    ├── setup.ts                     Vitest setup — jest-dom matchers, jsdom shims, log filters
    ├── e2e/                         Playwright editor/template/export/file-IO flows
    │   └── helpers/                 E2E page-object helpers
    ├── pages/
    │   ├── Editor/                  Editor unit/integration tests + exporter tests + helpers
    │   └── Templates/               Templates page integration tests + helpers
    ├── perf/                        Playwright performance checks
    └── shared/                      Shared component tests
```

## Tech stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **@flodesk/grain** as the design system and styling foundation (no Tailwind / MUI / Bootstrap by design)
- **React Router 7** for navigation
- **Vitest 4** + **@testing-library/react** + **jsdom** for tests
- **ESLint 10** (flat config) with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-import-x`
- **Bun** for installs and script execution (the `test` script invokes Vitest, not `bun test`)

## Continuous integration

Every pull request and every push to `main` runs `bun install --frozen-lockfile` → `format:check` → `lint` → `coverage` → `bundle:check` → `lighthouse:check` → `test:perf` → `test:e2e` on Ubuntu via GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).

## Known warnings

The Playwright run may log this React 19 warning from Grain:

```text
Accessing element.ref was removed in React 19. ref is now a regular prop.
```

This comes from `@flodesk/grain`, not application code. The test setup filters that specific warning where appropriate and keeps all other unexpected console errors visible.

## Tradeoffs

A few implementation choices in this take-home are intentionally pragmatic:

- **Zustand over a heavier editor state model**: the editor uses a shared Zustand store with explicit re-seeding per session. This keeps the state API small and easy to reason about for the assignment while still supporting undo/redo, selection state, and row/element mutations cleanly.
- **Static template previews as local data**: built-in templates are stored in source rather than fetched from an API. That keeps the assignment self-contained and makes template browsing instant, while leaving a clear seam for a server-backed catalog later.
- **Inline HTML export**: exported pages use inline HTML/CSS so the result opens without extra tooling. That favors portability and assignment clarity over maximum deduplication or theming sophistication.
- **Browser capability fallbacks instead of browser-specific branches in the UI**: file open/save/export uses the File System Access API where available and otherwise falls back to classic downloads and file input selection. This keeps the product usable across browsers without turning the UI layer into a compatibility matrix.
- **CI budgets tuned for regression detection, not production scoring**: Lighthouse and performance budgets are calibrated to noisy GitHub runners. They act as guardrails against major regressions, not as absolute product-quality grades.

## Known limitations

The current project is intentionally strong on breadth and correctness, but there are still limitations that I would address in a longer-lived production version:

- **No backend or persistence layer**: templates, drafts, and exported artifacts are all local-only. There is no authenticated account model, server persistence, or collaboration flow.
- **Editor schema is local-versioned, not migration-driven**: `.flodesk` files are versioned and validated, but there is not yet a full migration pipeline for evolving older draft versions over time.
- **Preview rendering is optimized for the assignment, not a fully extensible plugin ecosystem**: the element registry is clean and structured, but not yet designed as a third-party plugin platform.
- **Mobile editing is intentionally constrained**: mobile mode preserves preview and export flows, but the editing chrome stays desktop-first. That tradeoff keeps the interaction model simpler for the assignment.
- **Performance quality gates still depend on CI variance**: the performance and Lighthouse thresholds are useful and meaningful, but runner variability still matters more than it would in a preview-deployment-based measurement setup.

## What I would do next in production

If this were the foundation for a longer-lived product, the next steps I would prioritize are:

1. **Draft persistence and recovery**
   - add autosave and recovery for in-progress work
   - introduce a server-backed draft model with optimistic local caching

2. **Schema migrations for `.flodesk` files**
   - formalize version migration steps
   - add compatibility tests across historical file versions

3. **Richer editor ergonomics**
   - keyboard shortcuts beyond undo/redo
   - multi-select or block-level operations
   - improved drag/drop affordances and insertion cues

4. **Deeper accessibility pass**
   - more systematic keyboard navigation for complex editor surfaces
   - stronger semantics for drag-and-drop and selection states
   - automated a11y checks in CI in addition to current smoke coverage

5. **Preview-deployment performance measurement**
   - run Lighthouse against a deployed preview environment rather than only local preview on CI runners
   - tighten thresholds once the measurement environment is less noisy

6. **Template/catalog evolution**
   - fetch templates from an API
   - support richer metadata, search, experimentation, and content ownership workflows
