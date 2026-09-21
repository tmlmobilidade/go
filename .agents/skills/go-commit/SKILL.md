---
name: go-commit
description: Writes a GO conventional commit message. Run before committing or when asked to write a commit message. Inspects the diff, picks the right type and scope, and produces a properly formatted message ready to use.
---

# TML Commit

You are writing a commit message for a TML (Transportes Metropolitanos de Lisboa) codebase.

## Steps

### 1. Get the diff

Run `git diff --cached` to see staged changes. If nothing is staged, run `git diff HEAD`. If neither shows anything useful, ask the user what they want to commit.

### 2. Identify the type

Pick the one that best describes the change:

| Type | When to use |
|---|---|
| `feat` | New feature for the user |
| `fix` | Bug fix |
| `refactor` | Code change with no new feature or bug fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Maintenance, dependency bumps, config changes |
| `ci` | CI/CD pipeline changes |
| `style` | Formatting only, no logic change |
| `revert` | Reverts a previous commit |
| `wip` | Work in progress — draft PRs only, never merge to main |

### 3. Identify the scope

The scope is the area of the codebase affected. Each repo defines its own valid scopes in `commitlint.config.cjs`. Use the module or package name when relevant (e.g. `alerts`, `auth`, `ui`, `types`). Scope is optional but preferred when the change is clearly bounded.

### 4. Write the subject line

Complete this sentence mentally: *"If applied, this commit will ___"*

Rules:
- Format: `type(scope): description`
- Max 72 characters total
- Imperative mood — `add` not `added`, `fix` not `fixed`
- No trailing period

### 5. Add a body if needed

If the change is non-trivial or the *why* isn't obvious from the subject, add a blank line after the subject and write 1–3 sentences explaining the motivation or context.

### 6. Confirm

Show the final message and ask the user to confirm before they use it.

---

## Examples

```
feat(alerts): add bulk delete endpoint

fix(auth): handle expired refresh token on silent login

refactor(types): split AlertDto into create and update shapes

chore(deps): bump turbo to 2.9.11

perf(offer): add compound index on lineId and startDate

docs(skills): update add-module checklist with PermissionCatalog step

ci: add lint check to PR pipeline

feat(ui): add LockButton loading state to shared component library
```
