---
name: github-issues
description: >-
  Turn a request into reviewed, well-scoped GitHub issue tickets for the TML GO
  repository. Use when the user asks to create or plan a GitHub issue of any
  type (Bug, Feature, Documentation, Routine, Tooling, Infrastructure, Question).
---

# Create GitHub issues

Follow [the shared workflow](references/workflow.md) and [the field catalog](references/issue-fields.md).

## Type

Offer **Bug, Feature, Documentation, Routine, Tooling, Infrastructure, and Question** when the user has not already chosen one. Keep the type selector pending until they answer. Once the type is known, do not ask for another.

## Body from templates

Read the matching file under `.github/ISSUE_TEMPLATE/` and use it as the issue body shape. Match by template frontmatter (`name`, `about`, `type`) to the selected issue type. Fill every section from the agreed understanding; leave a section blank only when it truly does not apply. Do not invent a different body structure in the skill.

If no template exists for the selected type, say so and draft a plain body from the agreed understanding without adding skill-defined section scaffolding.

## Type-specific intake

Investigate repository facts yourself. Use `.agents/skills/go-architecture/SKILL.md` to keep proposed work inside module boundaries. Confirm shared understanding before drafting.

| Type | Focus the interview on |
|---|---|
| Bug | Affected user or system, expected vs actual behavior, impact, reproducible steps; ask for logs or environment only when they affect diagnosis |
| Feature | Who needs it, the problem, desired behavior, constraints, and how success is observed |
| Documentation | Audience, what they cannot find or trust, authoritative behavior, and where readers expect it |
| Routine | Maintenance need, cleanup scope, and the observable done condition; avoid turning it into a broad refactor unless evidence requires it |
| Tooling | Workflow or system, who uses it, current friction, expected repeatable outcome |
| Infrastructure | Environment or system, current vs desired state, operational impact, rollout or recovery constraints; never request secrets |
| Question | Exact question, why an answer is needed, context, and who is affected; do not invent implementation tickets or acceptance criteria |

## Drafting and publishing

Split only when distinct vertical slices deliver independently useful outcomes. Show each ticket's title, blockers, and delivered outcome; iterate until approved. Show the final title, body, and metadata, then publish only after explicit approval. Create with the selected issue type when the write tool supports it; otherwise put a labeled **Issue metadata** section in the body and say those values are body-only.
