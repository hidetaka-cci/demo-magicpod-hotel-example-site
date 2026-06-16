# AGENTS.md

## Cursor Cloud specific instructions

This repo is `hotel-example-site`: a **static, client-side** demo hotel-booking site
(webpack + Bootstrap/jQuery, no backend, no database). All app state lives in the
browser (Cookie / Session Storage / Local Storage). The `infra/` workspace is an
AWS CDK package used only for deployment and is not needed for local dev/testing.

### Toolchain (important gotcha)
- The project requires **Node 24** and **pnpm 11** (see `mise.toml`, `package.json`
  `engines`/`devEngines`). `mise` is not installed; Node 24 is provided via **nvm**
  (`nvm alias default 24`) and pnpm 11 via **corepack**.
- A fresh non-login shell may resolve `/exec-daemon/node` (Node 22) instead of Node 24.
  If `node -v` is not v24.x, run `nvm use 24` (or use a login shell). The update script
  activates nvm explicitly, so dependency installs are unaffected.
- Do not use `npm` for installs/scripts here — `npm` enforces `devEngines` and will fail
  with `EBADDEVENGINES` (it expects pnpm). Always use `pnpm`.

### Run / build / test (commands live in `package.json`; see also `README.md`)
- Dev server: `pnpm run start` → serves at `http://127.0.0.1:8080/` (open
  `/en-US/` or `/ja/`). Run `pnpm run build` at least once if you need `dist/`.
- Lint: `pnpm run lint` (Biome; currently emits warnings/infos only, exit 0).
  Format check: `pnpm run fmt:check` (Prettier).
- Unit tests: `pnpm run test:unit` (Vitest, 100% coverage gate + property-based tests).
  Property-based runs are slow; use `pnpm run test:unit:fast` (`PBT_NUM_RUNS=100`) for
  quick local feedback. Vitest logs `happy-dom` fetch-abort `DOMException` noise that is
  harmless when the suite passes.
- E2E: `pnpm run test` (Playwright, Chromium). Requires browsers once:
  `pnpm exec playwright install --with-deps`. The runner auto-starts the dev server if it
  isn't already running.

### Test accounts
- Predefined demo users live in `data/<locale>/user.json`, e.g.
  `clark@example.com` / `password`. Useful for login + reservation flows.
