---
name: create-linear-issue-go
description: Drafts and creates Linear issues for GO repo improvements after inspecting code, checking duplicates, and getting user confirmation.
disable-model-invocation: true
---

# Create Linear Issue For GO

Use when the user asks to create a Linear issue from a GO codebase improvement, bug, refactor, or cleanup request.

## Required Context

Load `tml-context` first. Use GO repo context from `skills/monorepo.md`, `skills/packages.md`, and frontend/backend skills when relevant.

## Workflow

1. Understand the request.
2. Inspect the GO codebase before drafting.
3. Identify affected modules, packages, and files.
4. Search Linear for similar existing issues.
5. If similar issues exist, show them and ask whether to reuse/update or create a new one.
6. Determine the correct Linear team/project. Ask the user if uncertain.
7. Draft the issue with:
   - Title
   - Problem
   - Proposed plan
   - Affected files
   - Acceptance criteria
   - Risks / migration notes
8. Ask the user to confirm.
9. Only after confirmation, create the Linear issue.
10. Return the Linear issue link.

## Rules

- Do not create an issue before user confirmation.
- Do not guess the Linear project if uncertain.
- Keep the issue small and actionable.
- Prefer implementation plans grounded in actual files found in the repo.
- If the requested change is too broad, propose splitting into multiple issues.