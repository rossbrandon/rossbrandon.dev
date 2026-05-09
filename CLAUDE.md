# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is `pnpm`; Node version is pinned in `.nvmrc` (24).

- `pnpm dev` — local dev server at `localhost:4321`
- `pnpm build` — static build to `./dist/`
- `pnpm preview` — preview the production build
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format:check` / `pnpm format` — Prettier
- `pnpm clean` — wipe `dist`, `node_modules`, `.astro`, `.pnpm-store`

There is no test suite. Don't invent one.

## Architecture

Static Astro 6 site deployed to Cloudflare (see `wrangler.jsonc`). The build output in `./dist/` is what Cloudflare serves; there is no SSR adapter and no runtime backend.

### Content collections (`src/content.config.ts`)

Four collections, all loaded via `glob` from markdown files. Schemas are the source of truth — frontmatter must match.

- **`pages`** — top-level markdown pages loaded directly from `src/pages/*.md` (e.g. `about.md`, `resume.md`).
- **`posts`** — `src/content/posts/*.md`. Supports `pinned` (skips prev/next chaining) and `hidden` (filtered out everywhere). Categories and tags drive `src/pages/categories/[category].astro` and `src/pages/tags/[tag].astro`.
- **`projects`** — `src/content/projects/*.md`. Schema uses Astro's `image()` helper for `cover`, so cover images must be co-located/resolvable as image assets. `category` is constrained to `'professional' | 'personal'`. Faceted filtering on the `/projects` index uses `getProjectFacets` in `src/utils/content.ts`.
- **`reading`** — `src/content/reading/*.md`. Sorted by status (`Reading` first), then `finishedDate` desc, then title.

All visibility/sort/grouping logic lives in `src/utils/content.ts` — prefer extending those helpers over duplicating `getCollection` filtering inline in pages.

### Layouts

- `src/layouts/base.astro` — HTML shell, fonts, SEO/OG/Twitter meta, JSON-LD, theme bootstrap (an inline script reads `localStorage.theme` before paint to avoid FOUC). Renders `Heading` + `<slot />` + `Footer`.
- `src/layouts/page.astro` — wraps `Base` for prose pages; reads `frontmatter.imageAlign` (`left` | `right` | `center`) to set a `.image-align-*` class consumed by `posts.css`/`page.astro` styles. Used by markdown pages via Astro's default layout convention and by post/project detail pages.

### Reading time

`plugins/remark-reading-time.mjs` is registered in `astro.config.mjs` and injects `minutesRead` (formatted string) and `wordCount` into `data.astro.frontmatter`. Access via `remarkPluginFrontmatter` from `render(entry)` — see `src/pages/posts/[id].astro`.

### Fonts

Space Grotesk and JetBrains Mono are loaded through Astro's `fontProviders.google()` and exposed as CSS variables (`--font-space-grotesk`, `--font-jetbrains`). Don't add `<link>` tags for Google Fonts — go through `astro.config.mjs`.

### Styles

CSS is layered: `tokens.css` (design tokens / CSS custom properties) → `components.css` (shared component primitives) → `global.css` (which `@import`s the other two and adds element-level resets). Post-specific styles live in `posts.css`. Prefer adding tokens or component classes over ad-hoc `<style>` blocks when the rule will be reused.

## Conventions

These are enforced or load-bearing — follow them.

### Path aliases (`tsconfig.json`)

`@assets/*`, `@components/*`, `@layouts/*`, `@pages/*`, `@styles/*`, `@utils/*`. Use these instead of relative paths across directories.

### Barrel exports

Every component directory has an `index.ts` that re-exports its components. Import the barrel, not the file:

```ts
// good
import { Heading } from '@components/heading';
// bad
import Heading from '@components/heading/heading.astro';
```

When adding a component to a directory, update its `index.ts`.

### TypeScript exports

`verbatimModuleSyntax` is on. Use a single block export at the bottom of `.ts` files rather than inline `export` on each declaration (see `src/utils/content.ts` for the pattern). Astro components export via `index.ts` barrels.

### ESLint import sort groups

`eslint-plugin-simple-import-sort` enforces this order — don't fight it:

1. `astro` and third-party packages
2. `@`-aliased and absolute imports
3. Relative `./` imports
4. Side-effect imports (`import '...'`)
5. CSS module imports
6. Media imports

### Prettier

2-space indent, single quotes, semicolons, trailing commas (`es5`), `arrowParens: always`. `.astro` files use the Astro parser via `prettier-plugin-astro`.

## Notes

- Do not hand-edit files under `.astro/` — generated.
- `src/pages/about.md` and `src/pages/resume.md` are top-level routes that flow through the `pages` collection schema; their frontmatter must satisfy the `pages` schema (title, pageTitle, date, author).
- `TODO.md` at the repo root tracks the user's open design/UX work; treat it as authoritative for in-flight tasks.
