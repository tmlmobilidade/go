---
name: github-issue-bug
description: Turn an unexpected behavior or defect into reviewed, actionable GitHub bug tickets for the TML GO repository.
---

# Create bug issue tickets

Use the shared process in [github-issues](../github-issues/references/workflow.md) and the [field catalog](../github-issues/references/issue-fields.md). This skill means the user has selected Bug; if not, use the `github-issues` dispatcher first.

Establish the affected user or system, expected behavior, actual behavior, impact, and reproducible steps. Ask for logs or environment details only when they affect diagnosis or acceptance criteria. Inspect the relevant code and related issues when the repository is available. Split only when distinct fixes can deliver independently useful behavior. Acceptance criteria should make the fix observable and prevent recurrence without prescribing implementation details.
