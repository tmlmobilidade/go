# Core banner API

All paths are relative to the Core API URL. Use generated `API_ROUTES.core` constants. All endpoints require a valid session and return the usual GO API envelope. Reader GET responses use `Cache-Control: no-store` for personalised state. Management and mutation endpoints follow the existing Core caching convention.

Handlers own request validation, queries, cache headers, and responses. Each entity’s update handler validates and saves content and publication status together.

Management supports GET list/detail (`read`), POST creation (`update`), and PUT `/:id` for content and publication status (`update`). Each scope has only `read` and `update`; the Dev team’s write capability covers creation, editing, publication, unpublishing, and archiving. Grant these permissions through existing role provisioning; a role name alone grants nothing, and no role documents are modified.

Lists accept optional `status=draft|published|archived`, return trimmed list items, and sort by update time descending then ID descending. Creation always makes a draft. Updates accept optional `status` (`draft`, `published`, `archived`) alongside content fields. IDs, audit metadata, lock state, publication metadata, and dismissal versions remain server-owned and are stripped from requests. Content and status can be updated atomically in the same request.

Publishing validates complete content and records the authenticated author and time. Publishing an already published document preserves its publication time. Unpublishing and archiving retain publication metadata. Edits to published content are immediately visible; unpublish before clearing required content.

Locked documents reject edits and publication changes. Atomic replacement matches the previous `updated_at`, which advances monotonically. Overlapping writes return `409`; stale editor tabs do not have a client-supplied revision precondition.

## Banner endpoints

Management uses `/operational-banners` and the `banners` permission scope. List items are trimmed; detail and mutations return the editorial document. Create/update DTOs use `CreateOperationalBannerSchema` and `UpdateOperationalBannerSchema`; merged documents are validated even when only one schedule bound changes.

Reader endpoints require authentication without editorial permissions:

- GET `/platform/banners`
- POST `/platform/banners/:id/dismiss`

Banner lists accept optional `module_id`. Without it, only platform-wide banners apply; with it, banners for that module also apply. They respect inclusive starts and exclusive ends, and are ordered by critical, warning, info, then newest publication, then descending ID. Reader DTOs exclude editorial audit and status fields. Previewing drafts should use authorized management detail and the shared UI renderer, not reader endpoints.

Dismissal takes `{ "dismissal_version": 1, "module_id": "offer" }`; module ID is optional for platform-wide notices. Inactive/out-of-scope notices return `404`; nondismissible or stale versions return `409`. A delayed request cannot replace a stored dismissal of a newer version. Material banner edits increment the version, making the updated notice visible again. Publication-only changes preserve it.

Acknowledgement returns `{ "success": true }` in the API envelope. Repeated dismissals of the same version retain one record.

## Errors and indexes

Malformed content, queries, cursors, or schedules return `400`; unavailable records return `404`; locks, concurrent writes, and stale versions return `409`. Missing/invalid sessions return HTTP `401`, and missing editorial permissions return `403`.

Index descriptions are defined in the shared Mongo interface package. The API does not provision them at startup. Use the normal database setup process to create the required indexes, including unique user/entity acknowledgement indexes. Route tests use mocked persistence and session lookups without contacting a live database.
