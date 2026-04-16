# Contributing

## Git hooks

This repository uses Husky hooks to enforce branch naming and commit message conventions.

- Install dependencies with `npm install` (this runs `npm run prepare` automatically).
- If hooks are not installed, run `npm run prepare`.

## Branch naming convention

Allowed long-lived branches:

- `main`
- `master`
- `develop`
- `production`
- `prd`

All other branches must follow:

```text
<type>/<description>
```

Allowed branch types:

- `feature`
- `feat`
- `bugfix`
- `fix`
- `hotfix`
- `release`
- `chore`

Description rules:

- Use lowercase letters and numbers.
- Use hyphens (`-`) between words.
- Dots are allowed inside a token (example: `v1.2.0`).
- Do not use spaces, underscores, uppercase, leading/trailing separators, or consecutive separators.

Valid examples:

- `feature/add-login-page`
- `feat/issue-123-new-login`
- `fix/header-bug`
- `hotfix/security-patch`
- `release/v1.2.0`
- `chore/update-dependencies`

## Commit message convention

Commit messages must follow Conventional Commits:

```text
<type>[optional scope]: <description>
```

Examples:

- `feat(auth): add token refresh endpoint`
- `fix(api): handle empty payload on route update`
- `docs: update setup instructions`
- `chore(ci): adjust workflow cache key`

## Fixing hook failures

- Branch hook failed: rename branch to valid format with `git branch -m <new-name>`.
- Commit hook failed: rewrite commit message to Conventional Commits format.
