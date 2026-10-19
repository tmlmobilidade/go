---
name: github-issues
description: Turn a request into reviewed, well-scoped GitHub issue tickets for the TML GO repository. Use when the user asks to create or plan a GitHub issue and has not already selected a specific issue type.
---

# Create GitHub issues

Route the request through a type-specific workflow. Ask the user to choose an issue type before gathering issue details, unless they already specified it. Offer **Bug, Feature, Documentation, Routine, Tooling, Infrastructure, and Question**. Use the question delivery and waiting procedure in [the shared workflow](references/workflow.md#asking-and-waiting). The type selection is required: keep the selector pending until the user actually answers.

After the user chooses, read the matching skill in `../github-issue-<type>/SKILL.md` (use `github-issue-documentation` for Documentation). Follow it together with [the shared workflow](references/workflow.md) and [the field catalog](references/issue-fields.md). If a type-specific skill was invoked directly, follow its workflow without asking the type again.

Follow the shared question delivery and waiting procedure for every interview question. Investigate repository facts yourself; do not ask the user to find facts available in the workspace or connected tools. Continue until the user and agent share an explicit understanding. Do not draft final tickets or publish them before the user confirms that understanding.

Draft tickets as complete, independently useful vertical slices when the work warrants multiple tickets. Show each ticket's title, blockers, and delivered user-visible behavior. Iterate on granularity and blocking edges until the user approves. Then prepare the final issue bodies and metadata for review; publish only after the user explicitly approves the concrete drafts. If publishing is unavailable or cannot faithfully represent the requested metadata, save approved Markdown tickets under the OS temporary directory and report their paths.
