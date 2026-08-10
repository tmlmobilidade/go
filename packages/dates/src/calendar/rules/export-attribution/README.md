# GTFS export attribution

Maps scheduling rules to GTFS `service_id` tokens, `calendar_dates.txt`, and `trips.txt`.

**Behaviour contract:** [SCENARIOS.md](./SCENARIOS.md) (principles, scenario IDs, acceptance criteria).

## Quick reference

- **One circulation** per pattern × timepoint × day (no plain + event token both active).
- **Calendar membership** ≠ **operational binding** — use `trips.txt` (+ OFF variants), not `calendar_dates.txt` alone.
- **Forced retarget** — replacement on event dates; base → `{BASE}-OFF-{EVENT}`; disjoint Saturday tokens when needed (FR-02).
- **FR-04** — prefer existing manual when it already matches `computeActiveRules` on the event date.
- **ND-03** — overlapping general manuals: primary schedule wins shared timepoints.
- **ND-05** — do not merge event-specific includes into general weekend rows in `mergeSubset`.

## vs `computeActiveRules`

Both APIs share the same inputs (manuals, replacements, periods, holidays, events) and helpers (`resolveEffectiveReplacement`, matchers). They answer different questions:

| | `computeActiveRules` | `collectGtfsIncludeContributionsForDate` |
|---|------------------------|------------------------------------------|
| **Output** | `{ timepoints, appliedRuleIds }` | `{ kind, rule, timepoint, excludeRule? }[]` |
| **Purpose** | Operating schedule for the day | GTFS `service_id` / include–exclude date binding |
| **Overlapping general manuals** | Union of all matching include TPs | One `operating` owner per TP (primary wins, ND-03) |
| **Event displacement** | Final set only | `operating` on event/replacement + `base_off` on displaced base |
| **Replacement (forced retarget)** | Intersection + excludes + restrictions | Uses `computeActiveRules` for TPs, then assigns tokens (FR-*) |

**Consumers**

- Preview, rules grid, VKM → `computeActiveRules` (“what runs today”).
- GTFS exporter (`trips.ts`) → `collectGtfsIncludeContributionsForDate` (also uses `computeActiveRules` for applied-rule metadata).

**Invariant (P5):** the set of `operating` timepoints must match `computeActiveRules(date, …).timepoints` for the same inputs.

## Public API (`index.ts`)

| Function | Role |
|----------|------|
| `collectGtfsIncludeContributionsForDate` | Main entry: per-date `operating` / `base_off` contributions |
| `compareGeneralManualOwnershipPriority` | ND-03 tie-break when general manuals overlap |

See JSDoc on `index.ts` for private helpers (`collectNormalDayContributions`, `collectReplacementDayContributions`).

## Files

| File | Role |
|------|------|
| `index.ts` | Per-day contributions (`operating`, `base_off`) |
| `canonical-registry.ts` | Canonical date sets; replacement emit guard |
| `replacement.ts` | Forced retarget detection |
| `collectors.ts` | Per-rule manual / replacement matching |

**Tests:** `packages/dates/tests/export-attribution.test.ts` (cite scenario IDs from SCENARIOS).