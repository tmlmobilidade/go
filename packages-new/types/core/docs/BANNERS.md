# GO banner contracts

Shared contracts live in `src/banners/`. Mongo access uses `goDb.core.banners` (`core.banners`) and `goDb.core.bannerDismissals` (`core.banner-dismissals`).

IDs are strings. Times are UTC Unix milliseconds stored as numbers, following GO's shared timestamp contract. Content is shared across organizations. Scope is explicitly platform-wide or a nonempty list of unique module IDs. The `root` application shell is not a domain module.

## Operational banners

Banners contain `kind` (`maintenance`, `incident`, `announcement`), title, message, severity (`info`, `warning`, `critical`), scope, optional HTTP(S) link, optional start/end times, and dismissibility. Drafts may omit title/message content; published banners require both. If both schedule bounds exist, the end must be strictly after the start.

Reader eligibility is `status === 'published'`, matching scope, `starts_at === null || starts_at <= now`, and `ends_at === null || now < ends_at`. Scheduling never changes the stored publication status. Sort eligible banners by severity (critical, warning, info), then descending publication time, then ID for ties. `critical` maps to the existing UI's `danger` appearance.

`dismissal_version` begins at 1 and is server-controlled. Increment it atomically when title, message, kind, severity, scope, link, schedule, or dismissibility changes. Audit-only edits leave it unchanged. Publication/deactivation alone preserves the version; maintainers should create a new notice for a new occurrence.

## Publication and editing

Editorial documents reuse `BaseDocumentSchema` audit fields and the shared `PublishStatusSchema`: `draft`, `published`, `archived`. Publication metadata (`published_at`, `published_by`) must be supplied together and is required while published. Retain it when unpublishing to draft or archiving; a new publication action may replace it.

Create DTOs accept content only and creation always starts as a draft. Update DTOs accept content and optional `status` (`draft`, `published`, `archived`). IDs, audit fields, lock state, publication metadata, and dismissal versions remain server-owned. The update handler records publication time/author when transitioning to published. Validate the complete merged document before storing edits, including when a patch changes only one schedule bound. Saving edits to published content updates it immediately; there are no separate private revision snapshots in this version.

These schemas validate document shape. The Core API authorizes editorial actions, enforces server ownership, and returns only published releases/current banners to ordinary users. Reader responses exclude editorial audit fields. See the corresponding Core API documentation for endpoint contracts.

## Dismissals

`BannerDismissal` contains `_id`, `user_id`, `banner_id`, `dismissal_version`, and `dismissed_at`. Upsert on `(user_id, banner_id)`. A dismissal hides a banner only when its version equals the current banner version. Before writing, verify the banner is dismissible and its version still matches the submitted version. Reject stale requests so an old tab cannot dismiss a newly updated banner.

Derive user identity and timestamps on the server. These interaction documents intentionally have no editorial audit or lock fields. They store acknowledgements, not event histories. The factory's generated creation/update fields are stripped by their schemas.

## Index provisioning

Index descriptions are declared in `packages-new/interfaces/godb/src/indexes/core/` and passed to the collection factory. The factory currently stores these descriptions without creating MongoDB indexes. Provision indexes through your normal database setup process; the Core API does not create them at startup. There are no TTL indexes.

Keep the unique `(user_id, banner_id)` index for dismissal lookups and the published-banner index for feed filtering.
