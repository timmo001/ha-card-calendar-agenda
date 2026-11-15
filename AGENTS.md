# Agent instructions

This is Calendar Agenda Card, a Home Assistant Lovelace card that shows
calendar events as an agenda. It is written in TypeScript with Lit, and built to
`dist/calendar-agenda-card.js` for HACS. The card is experimental, so breaking
changes are allowed.

## Stack

- pnpm, pinned as `packageManager` in `package.json` and in `mise.toml`. Keep
  pnpm rather than converting to Bun.
- Node, pnpm and the linters are pinned with mise. `mise.lock` is committed, so
  update it with `mise lock` after changing a pin.
- Build with rolldown, lint with Oxlint (`@timmo001/oxlint-rules`), format with
  Prettier.
- Pin JavaScript dependencies to exact versions (`pnpm add -E`).

## Checks

- `mise run check` lints and builds. Run it before a commit.
- `mise run format` formats with Prettier. It isn't in `check` yet, because some
  existing files aren't formatted.
- The pre-push hook (`hk.pkl`) runs `mise run lint`.

## Rollout

- Lint, build and HACS validate run on pull requests and on pushes to `main`.
  They come from `timmo001/workflows`, pinned in `.github/workflows/`.
- A GitHub release runs the release workflow, which publishes
  `calendar-agenda-card.js`.
- Renovate handles dependency updates.
