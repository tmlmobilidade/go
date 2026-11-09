# GTFS export attribution

Maps scheduling rules to GTFS `service_id` tokens, `calendar_dates.txt`, and `trips.txt`.

**Behaviour contract:** [SCENARIOS.md](./SCENARIOS.md) (principles, scenario IDs, acceptance criteria).

## Quick reference

- **One circulation** per pattern × timepoint × day (no plain + event token both active).
- **Calendar membership** ≠ **operational binding** — use `trips.txt` (+ OFF variants), not `calendar_dates.txt` alone.
- **Forced retarget** — replacement on event dates; base → `{BASE}-OFF-{EVENT}`; disjoint Saturday tokens when needed (FR-02).
- **FR-04** — prefer existing manual when it already matches `computeActiveRules` on the event date.
- **ND-03** — overlapping general manuals: a strictly broader calendar scope owns shared timepoints; otherwise more timepoints, then rule ID, decide.
- **ND-05** — do not merge event-specific includes into general weekend rows in `mergeSubset`.

## vs `computeActiveRules`

Both APIs share the same inputs (manuals, replacements, periods, holidays, events) and helpers (`resolveEffectiveReplacement`, matchers). They answer different questions:

| | `computeActiveRules` | `collectGtfsIncludeContributionsForDate` |
|---|------------------------|------------------------------------------|
| **Output** | `{ timepoints, appliedRuleIds }` | `{ kind, rule, timepoint, excludeRule? }[]` |
| **Purpose** | Operating schedule for the day | GTFS `service_id` / include–exclude date binding |
| **Overlapping general manuals** | Union of all matching include TPs | One `operating` owner per TP (broader scope, then primary schedule, ND-03) |
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

The public entry points stay exported through `index.ts`. Internal day collectors live beside it so ownership ordering and replacement handling can be reviewed independently.

## Files

| File | Role |
|------|------|
| `index.ts` | Filter manual candidates for event date/month; dispatch normal vs replacement days |
| `manual-ownership.ts` | Calendar scope containment and deterministic shared-timepoint ownership |
| `normal-day-contributions.ts` | Normal-day ownership; reconcile includes/exclusions against the operating calculator |
| `replacement-day-contributions.ts` | Forced-retarget and same-weekday attribution, including displaced base rows |
| `canonical-registry.ts` | Canonical date sets; replacement emit guard |
| `replacement.ts` | Forced retarget detection |
| `collectors.ts` | Per-rule manual / replacement matching |

**Tests:** `packages-new/utils/offer/tests/export-attribution.test.ts` (cite scenario IDs from SCENARIOS).

## Responsibility boundaries

1. `calculation/` determines which departures actually run. Attribution must preserve that operating set.
2. Normal-day attribution chooses one manual owner per departure and records displaced base service.
3. Replacement-day attribution decides whether the Event or a calendar manual owns that departure.
4. The registry and trip-row helpers collect dates and bind service identifiers; localized display labels are not rule identities.

All collectors are pure with respect to their input rules and documents. Working sets/maps belong to the current evaluation. Supply agency-scoped Periods, Holidays and Events; this layer does not perform permission filtering or database access. Keep changes to precedence or replacement semantics separate from file organization and verify them against SCENARIOS.md.
