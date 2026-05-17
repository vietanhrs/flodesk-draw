# flodesk-draw

A browser-based page builder where non-technical users pick a starting template, customise it block-by-block, and export the result as a static HTML document with inline styles — no toolchain required to view it. Referenced media (images, video embeds, link targets) keeps its original URLs.

Built as a take-home around Flodesk's [Grain](https://grain.flodesk.com/) design system.

## Features

- **Templates page** — browse built-in templates (sale announcement, welcome note, newsletter, thank-you note, …), filter by goal.
- **Editor** — drag-and-drop rows and elements (heading, paragraph, button, image, divider, spacer, quote, video, social), live preview, undo/redo with history merging.
- **Configuration pane** — page-, layout- (per-row), and element-level controls that reflect changes immediately on the canvas.
- **Viewport toggle** — switch the preview between desktop (1080px) and mobile (390px).
- **Export** — produce a single `.html` document with inline HTML/CSS. Images (`<img src>`), video embeds (YouTube `<iframe src>`), and link targets (button/social `href`) remain URL-referenced. Uses the File System Access API where supported, otherwise a regular blob download.
- **Local persistence** — your in-progress page is stashed in `localStorage` per template, so a refresh doesn't lose work.

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

| Command            | What it does                                                             |
| ------------------ | ------------------------------------------------------------------------ |
| `bun run dev`      | Start the Vite dev server (HMR) at `http://localhost:5173`.              |
| `bun run build`    | Type-check (`tsc -b`) and produce a production build in `dist/`.         |
| `bun run preview`  | Serve the production build locally.                                      |
| `bun run lint`     | Run ESLint over the source tree.                                         |
| `bun run test`     | Run Vitest in watch mode. Append `--run` for a single pass.              |
| `bun run coverage` | Run the test suite once with v8 coverage; report written to `coverage/`. |

## Project layout

```
flodesk-draw/
├── .github/workflows/ci.yml         GitHub Actions: lint → test → build on every PR + push to main
├── .bun-version                     Pinned Bun version
├── index.html                       Vite entry
├── vite.config.ts                   Vite + Vitest config (jsdom env, path aliases)
├── eslint.config.js                 ESLint flat config (TS, React Hooks, import order)
├── tsconfig.{json,app,node}.json    TypeScript project references
│
├── public/                          Static assets served as-is (fonts, etc.)
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
│       ├── Templates/               Template gallery — sidebar, mobile header, card grid
│       └── Editor/
│           ├── Editor.tsx           Shell composition (header + body + modal)
│           ├── components/
│           │   ├── Canvas/          Paper, rows, drop zones, floating row menu
│           │   ├── ConfigPane/      Page / Layout / Element tabs + controls
│           │   ├── ElementMenu/     Draggable element palette with category + search
│           │   ├── Header/          Title, history, viewport toggle, build button
│           │   └── BuildModal.tsx   Export progress + status dialog
│           ├── exporter/            Page → static HTML and download orchestration
│           ├── state/               EditorContext (reducer + history), types, element catalog
│           └── utils/               Drag dataTransfer helpers, id generator
│
└── test/
    ├── setup.ts                     Vitest setup — jest-dom matchers, jsdom shims, log filters
    └── pages/
        ├── Editor/                  Editor integration tests + buildHtml unit tests + helpers
        └── Templates/               Templates page integration tests
```

## Tech stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **@flodesk/grain** as the design system and styling foundation (no Tailwind / MUI / Bootstrap by design)
- **React Router 7** for navigation
- **Vitest 4** + **@testing-library/react** + **jsdom** for tests
- **ESLint 10** (flat config) with `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-import-x`
- **Bun** for installs and script execution (the `test` script invokes Vitest, not `bun test`)

## Continuous integration

Every pull request and every push to `main` runs `bun install --frozen-lockfile` → `lint` → `test --run` → `build` on Ubuntu via GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
