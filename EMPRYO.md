# EMPRYO.md

Empryo loads this file by default. The project rules live in two other files so that every tool
(Cursor, Claude Code, Copilot, Empryo) shares one copy — read both before any change:

- [`AGENTS.md`](./AGENTS.md) — project map, commands, quality gate, agent team
- [`DESIGN.md`](./DESIGN.md) — the UI contract: tokens, layout, responsive, components, copy,
  definition of done

Agent definitions: `.claude/agents/`. A task is done when `npm run verify` passes.
