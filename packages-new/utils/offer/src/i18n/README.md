# Shared Offer translations

Scheduling summaries, day-period labels and GTFS naming need translations in both the GO frontend and server-side exports. Their JSON resources belong to Offer and are shared under the `offerScheduling` namespace.

## Frontend

Register `offerSchedulingResources` alongside the app and UI resources in the frontend's existing i18next instance. Components keep using `useTranslation()` and pass its `t` function into shared formatters. The viewer's language controls summaries and labels; do not create another instance in components.

## Server-side exports

Use `await createOfferTranslator(agency.primary_language)` once per agency per export, then pass the returned `t` function through the naming helpers. This creates a React-independent i18next instance with the same ICU plugin and JSON resources as the frontend. It does not require a React provider or `'use client'`.

The returned translator is fixed to the agency language. Separate instances let concurrent exports use different languages without changing global language state or depending on a viewer's preferences. Do not create instances inside rule or timepoint loops.

## Formatting conventions

- Shared formatters receive `t`; they do not select dictionaries or replace placeholders themselves. Use ICU syntax for interpolation and plurals, consistent with GO's existing frontend setup.
- Helpers qualify keys with `offerScheduling:`, so they work with either the frontend translator or the standalone export translator.
- Pass `locale` explicitly for date, month, weekday and list formatting as well. In exports, use the agency language for both `locale` and `t`.
- Event codes and Period short names are agency-owned data, not translation keys. Technical GTFS markers also stay independent of translated UI copy.
- Keep app-only copy in frontend resources and generic UI copy in `packages/ui`; this namespace holds Offer text needed by shared consumers.

The standalone instance currently falls back to English for unsupported languages; the frontend retains its existing app fallback configuration.
