# TML Mobilidade GitHub issue types and fields

Organization: `tmlmobilidade`.

## Issue types and applicable fields

| Type | Intended use | Fields |
|---|---|---|
| Question | A question | Modules |
| Bug | Unexpected problem or behavior | Priority, Progress, AI, Start date, Target date, Modules |
| Feature | Request, idea, or new functionality | Priority, Progress, AI, Start date, Target date, Modules |
| Documentation | Documentation improvement or addition | Priority, Progress, AI, Start date, Target date |
| Routine | Regular maintenance to keep things tidy | Priority, Progress, AI |
| Tooling | Preview environments, build systems, automations, and development workflows | Priority, Progress, AI, Start date, Target date |
| Infrastructure | Kubernetes, databases, and supporting systems | Priority, Progress, AI, Start date, Target date |

## Field options

| Field | Kind | Allowed values |
|---|---|---|
| AI | Single select | AI Ready; Needs Context; Not for AI |
| Modules | Multi select | apex; core; dates; hub; infrastructure; offer; operation; performance; tracker |
| Progress | Single select | Idea; Planned; Working; Testing; Done; Stale; Canceled; Duplicate |
| Quarter | Single select, optional/unpinned | 26Q1; 26Q2; 26Q3; 26Q4; 27Q1; 27Q2; 27Q3; 27Q4 |
| Priority | Single select | Urgent; Normal |
| Start date | Date, optional | ISO date |
| Target date | Date, optional | ISO date |

Field IDs from the supplied organization configuration: AI `48097493`; Modules `48096980`; Progress `48099283`; Quarter `48101853`; Priority `23680613`; Start date `23680614`; Target date `23680615`.

Quarter is not pinned to any listed issue type. Do not set it unless the user requests it and the publishing mechanism accepts it. Its options reflect the supplied configuration and may become outdated; verify live options before native assignment when possible.

The configured issue type and field definitions came from the request that created this skill. If live GitHub configuration disagrees, use the live configuration and tell the user about the difference before publishing.
