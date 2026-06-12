# serviceparadigm.com

Corporate website for Paradigm IT Services. Engineering the Next Paradigm.

## Stack

- **Framework**: Astro 6 + Vue 3 (islands)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Fonts**: Instrument Serif (headlines), Switzer (body), Space Grotesk (labels)
- **Package manager**: Bun 1.3+
- **Deployment**: Cloudflare Pages (via REST API)

## Quickstart

```bash
bun install
bun run dev       # http://localhost:4321
bun run build     # output to dist/
bun run preview   # preview built site
```

## Scripts

- `bun run dev` — dev server with HMR
- `bun run build` — production build
- `bun run lint` — ESLint
- `bun run test:all` — unit + e2e tests
- `bun run ci:full` — full CI suite (typecheck → lint → test → build → audit)
- `bun run deploy` — deploy to CF Pages (via Forgejo CI)

## Design System

Reference design specs in `docs/`:
- `docs/DESIGN.md` — design system strategy ("The Digital Lithograph")
- `docs/code.html` — reference UI implementation
- `docs/screen.png` — visual mockup

## CI/CD

Three-tier Forgejo Actions pipeline:
1. `ci.yml` — typecheck, lint, unit tests
2. `validate.yml` — staging deploy, E2E, Lighthouse
3. `deploy.yml` — production deploy to Cloudflare Pages

## License

Proprietary — Paradigm IT Services.
