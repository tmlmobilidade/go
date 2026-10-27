# Core changelog API

All paths are relative to the Core API URL. Use generated `API_ROUTES.core` constants. All endpoints require a valid session and return the usual GO API envelope. Reader GET responses use `Cache-Control: no-store` for personalised state. Management and mutation endpoints follow the existing Core caching convention.

Handlers own request validation, queries, cache headers, and responses. Each entity’s update handler validates and saves content and publication status together.

Management supports GET list/detail (`read`), POST creation (`update`), and PUT `/:id` for content and publication status (`update`). Each scope has only `read` and `update`; the Dev team’s write capability covers creation, editing, publication, unpublishing, and archiving. Grant these permissions through existing role provisioning; a role name alone grants nothing, and no role documents are modified.

Lists accept optional `status=draft|published|archived`, return trimmed list items, and sort by update time descending then ID descending. Creation always makes a draft. Updates accept optional `status` (`draft`, `published`, `archived`) alongside content fields. IDs, audit metadata, lock state, publication metadata, and dismissal versions remain server-owned and are stripped from requests. Content and status can be updated atomically in the same request.

Publishing validates complete content and records the authenticated author and time. Publishing an already published document preserves its publication time. Unpublishing and archiving retain publication metadata. Edits to published content are immediately visible; unpublish before clearing required content.

Locked documents reject edits and publication changes. Atomic replacement matches the previous `updated_at`, which advances monotonically. Overlapping writes return `409`; stale editor tabs do not have a client-supplied revision precondition.

## Changelog endpoints

Management uses `/changelog-releases` and the `changelogs` permission scope. List items include category counts without full change bodies; detail and mutations return the editorial document. Nested change IDs remain stable and unique within a release.

Reader endpoints require authentication without editorial permissions:

- GET `/platform/changelog`
- GET `/platform/changelog/:id`
- POST `/platform/changelog/seen`

The changelog list accepts optional `module_id` and returns all matching published releases. With no module filter it includes every published release. With a module filter it includes platform-wide releases and releases affecting that module. Order is publication time descending, then ID descending. A response's `data` looks like:

```json
[
  {
    "_id": "release-id",
    "title": "Offer update",
    "summary": "Clearer validation when editing routes.",
    "scope": { "type": "modules", "module_ids": ["offer"] },
    "published_at": 1793016000000,
    "is_seen": false,
    "category_counts": { "new_feature": 0, "improvement": 1, "bug_fix": 0 }
  }
]
```

Readers derive the unread count from summaries where `is_seen` is false. List/detail GET requests never acknowledge content. The detail response replaces category counts with the ordered `items` array. Drafts and archived releases return `404` through reader detail endpoints. Empty feeds return `[]`.

Marking seen takes `{ "release_ids": ["release-id"] }` (1–100 unique published IDs). The server derives user/time and preserves the first seen timestamp. Previously seen releases remain readable; publication changes and edits preserve their seen state. Clients must submit only cards actually displayed after opening the reader. Authentication cannot prove whether content was rendered on screen.

Acknowledgement returns `{ "success": true }` in the API envelope.

## Errors and indexes

Malformed content, queries, or schedules return `400`; unavailable records return `404`; locks, concurrent writes, and stale versions return `409`. Missing/invalid sessions return HTTP `401`, and missing editorial permissions return `403`.

Index descriptions are defined in the shared Mongo interface package. The API does not provision them at startup. Use the normal database setup process to create the required indexes, including unique user/entity acknowledgement indexes. Route tests use mocked persistence and session lookups without contacting a live database.
