---
name: github-issue-feature
description: >-
  Create Feature GitHub issues for the TML GO repository with What to build,
  Acceptance criteria, and Blocked by. Use when the user asks to create a
  Feature issue or a feature ticket.
---

# Create Feature issues

Follow the shared process in [github-issues](../github-issues/references/workflow.md) and the [field catalog](../github-issues/references/issue-fields.md). This skill means the type is Feature; do not ask for another type.

## Issue body

Write the body yourself in this shape. Do not read issue templates.

```markdown
## What to build

<complete user-visible behavior>

## Acceptance criteria

- [ ] <Criterion>

## Blocked by

- <blocking issue references, or None (can start immediately)>
```

Omit **Blocked by** when blockers are native dependency links.

## Workflow

1. Clarify who needs the capability, the problem it solves, the desired behavior, constraints, and how success will be observed. Investigate repository facts yourself. Use `.agents/skills/go-architecture/SKILL.md` to keep work inside module boundaries.
2. Confirm shared understanding before drafting.
3. Draft end-to-end vertical slices when needed. For each ticket show **Title**, **What to build**, **Acceptance criteria**, and **Blocked by**. Iterate until approved.
4. Show the final title, body, and Feature metadata. Publish only after explicit approval.
5. Create the issue as type Feature when the write tool supports it. If native type or org fields cannot be set, put a labeled **Issue metadata** section in the body and say those values are body-only.

Acceptance criteria must be observable checklist items. Do not turn prototype details into requirements unless the user confirms them.
