# Ross Brandon: Portfolio Site

## 🚀 Project Structure

The Astro docs (which are incredible, btw) have a [reference project structure](https://docs.astro.build/en/basics/project-structure/).

Inside of the project, you'll see the following structure:

```text
/
├── public/
|   ├── favicon.svg
│   └── robots.txt
├── src
│   ├── assets
│   │   └── images
│   ├── content
│   │   └── posts
│   ├── components
|   |   ├── heading
│   │   └── etc
│   │ layouts
|   |   ├── base.astro
│   │   └── layout.astro
│   ├── pages
│   │   ├── posts
│   │   └── etc
│   ├── styles
│   │   ├── global.css
│   │   └── etc
│   ├── utils
│   │   ├── content.ts
│   │   └── etc
|   └── content.config.ts
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
| `pnpm format:check`    | Check file formatting with Prettier              |
| `pnpm format`          | Fix file formatting with Prettier                |
| `pnpm lint`            | Check for linting errors with ESLint             |
| `pnpm lint:fix`        | Fix linting errors with ESLint                   |

## MCP

Astro has an [Astro Docs MCP](https://docs.astro.build/en/guides/build-with-ai/#astro-docs-mcp-server) that is available. It is helpful to connect to Cursor, Claude Code, etc when developing this application.

## Typescript

See the Astro docs for more information on [setting up Typescript](https://docs.astro.build/en/guides/typescript/).

## ESLint

See the Astro docs for more information on [setting up ESLint](https://docs.astro.build/en/editor-setup/#eslint).
Plugin information: [eslint-plugin-astro](https://ota-meshi.github.io/eslint-plugin-astro/user-guide/).

## Prettier

See the Astro docs for more information on [setting up Prettier](https://docs.astro.build/en/editor-setup/#prettier).

## Astro Plugins & Integrations

- [MDX](https://docs.astro.build/en/guides/integrations-guide/mdx)
- [Sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/#why-astro-sitemap)
