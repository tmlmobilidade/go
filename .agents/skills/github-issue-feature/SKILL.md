---
name: github-issue-feature
description: Shape a requested capability into reviewed, independently deliverable GitHub feature tickets for the TML GO repository.
---

# Create feature issue tickets

Use the shared process in [github-issues](../github-issues/references/workflow.md) and the [field catalog](../github-issues/references/issue-fields.md). This skill means the user has selected Feature; if not, use the `github-issues` dispatcher first.

Clarify who needs the capability, the problem it solves, the desired behavior, constraints, and how success will be observed. Inspect repository architecture and existing behavior as needed; use `.agents/skills/go-architecture/SKILL.md` to keep proposed work within module boundaries. Draft end-to-end tracer bullets and genuine blockers. Consider a prototype only when it would resolve a meaningful product or technical uncertainty; do not turn prototype details into implementation requirements unless the user confirms them.
