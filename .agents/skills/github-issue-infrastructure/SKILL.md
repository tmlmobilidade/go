---
name: github-issue-infrastructure
description: Turn Kubernetes, database, or supporting-system work into reviewed GitHub infrastructure tickets for the TML GO repository.
---

# Create infrastructure issue tickets

Use the shared process in [github-issues](../github-issues/references/workflow.md) and the [field catalog](../github-issues/references/issue-fields.md). This skill means the user has selected Infrastructure; if not, use the `github-issues` dispatcher first.

Clarify the affected environment or system, current state, desired state, operational impact, and any rollout or recovery constraints. Verify repository-owned configuration where possible; never request or include secrets. Define acceptance criteria for a verifiable operational result and its relevant health or recovery behavior. Keep changes scoped to independently useful slices and make true rollout dependencies explicit.
