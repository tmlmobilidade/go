# GO AI Skills

This directory contains GO-specific context files used by Cursor rules and repo-local agent workflows.

## Setup

Install the shared TML skills once with Scribe:

```bash
scribe install tmlmobilidade/tml-skills
```

This makes the global skills available by name in supported agents:

- `tml-context` — TML organisational and platform context
- `tml-frontend` — shared frontend conventions across TML codebases
- `tml-commit` — TML conventional commit message helper

## How This Repo Uses Skills

The GO repo keeps repo-specific context here:

- `monorepo.md` — GO structure, modules, packages, build system, route generation
- `packages.md` — shared `@tmlmobilidade/*` package reference
- `backend.md` — GO API conventions
- `frontend.md` — GO frontend conventions

Cursor auto-attaches these files through `.cursor/rules/*.mdc` using repo-local references such as `@skills/frontend.md`.

Global Scribe skills are different: use them by skill name, for example `tml-context` or `tml-frontend`. Do not reference global Scribe skills as `@skills/...` unless they have been copied or symlinked into this repo.

## Recommended Usage

For general GO work, load `tml-context` first, then rely on the always-on GO context rule.

For frontend work, load `tml-context`, then `tml-frontend`, then use the GO-specific frontend context from `skills/frontend.md`.

For backend work, load `tml-context`, then use the GO-specific backend context from `skills/backend.md`.

For commit messages, use `tml-commit`; it should inspect the staged diff and follow `commitlint.config.cjs`.
