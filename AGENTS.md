# Fact Researcher

Fact Researcher is a privacy-first, client-side SvelteKit workbench for reviewing facts. Do not add network requests, analytics, remote assets, or server processing.

## Code and workflow

- Use ES modules and JavaScript with JSDoc; do not add TypeScript.
- Use Svelte 5 runes and callback props; components own local UX state and pages stay thin.
- Use Tailwind v4 utilities and accessible controls with visible focus states.
- Do not commit unless explicitly requested.
- After changes run `pnpm format`, `pnpm check`, `pnpm lint`, and `pnpm test` when tests change.
- Use `.spec.js` with Vitest in Node for pure logic and injected browser-like dependencies. Put tests that touch the DOM, browser globals, or full app behavior under `e2e/` and run them with Playwright via `pnpm test:e2e`.
- Run the Svelte autofixer when available after editing `.svelte` files.
