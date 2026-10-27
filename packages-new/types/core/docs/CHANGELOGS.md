# GO changelog contracts

Shared contracts live in `src/changelogs/`. Mongo access uses `goDb.core.changelogs` (`core.changelogs`) and `goDb.core.changelogViews` (`core.changelog-views`).

IDs are strings. Times are UTC Unix milliseconds stored as numbers, following GO's shared timestamp contract. Content is shared across organizations. Scope is explicitly platform-wide or a nonempty list of unique module IDs. The `root` application shell is not a domain module.

## Releases

A release contains a title, summary, scope, and ordered `items`. Each item has a stable `_id`, category (`new_feature`, `improvement`, `bug_fix`), title, and nullable description. Category counts are derived from items. Changing order preserves item IDs.

Drafts may have empty titles, summaries, and item lists. Published releases require all three plus publication metadata. Items, when supplied, must have valid titles and unique IDs within the release. Plain strings do not impose a content language; use Portuguese for initial editorial content. Rendering and interface translations belong to the reader implementation.

## Publication and editing

Editorial documents reuse `BaseDocumentSchema` audit fields and the shared `PublishStatusSchema`: `draft`, `published`, `archived`. Publication metadata (`published_at`, `published_by`) must be supplied together and is required while published. Retain it when unpublishing to draft or archiving; a new publication action may replace it.

Create DTOs accept content only and creation always starts as a draft. Update DTOs accept content and optional `status` (`draft`, `published`, `archived`). IDs, audit fields, lock state, publication metadata, and dismissal versions remain server-owned. The update handler records publication time/author when transitioning to published. Validate the complete merged document before storing edits, including when a patch changes only one schedule bound. Saving edits to published content updates it immediately; there are no separate private revision snapshots in this version.

These schemas validate document shape. The Core API authorizes editorial actions, enforces server ownership, and returns only published releases/current banners to ordinary users. Reader responses exclude editorial audit fields. See the corresponding Core API documentation for endpoint contracts.

## Views

`ChangelogView` contains `_id`, `user_id`, `release_id`, and `seen_at`. Upsert on `(user_id, release_id)` with `$setOnInsert` to preserve the first seen time. Record only displayed releases after the user opens the reader. Fetching content in the background is not acknowledgement. Edits and republication of the same release preserve seen state; a new announcement gets a new release ID.

Derive user identity and timestamps on the server. These interaction documents intentionally have no editorial audit or lock fields. They store acknowledgements, not event histories. The factory's generated creation/update fields are stripped by their schemas.

## Index provisioning

Index descriptions are declared in `packages-new/interfaces/godb/src/indexes/core/` and passed to the collection factory. The factory currently stores these descriptions without creating MongoDB indexes. Provision indexes through your normal database setup process; the Core API does not create them at startup. There are no TTL indexes.

Keep the unique `(user_id, release_id)` index for view lookups and the `(status, published_at, _id)` index for feed ordering.

## Feed response

The changelog API returns all matching published release summaries as an array, newest first, with per-user `is_seen` flags and category counts. The only optional query filter is `module_id`; there are no pagination parameters or page metadata. Readers derive unread counts from the returned summaries.
