# How scheduling rules compute timepoints — GO vs GTFS exporter

## Core concepts

A **pattern** has a `rules[]` array containing three kinds of rules:
- `manual` (`include` or `exclude`) — weekday + year-period based schedule entries
- `event_replacement` — overrides the schedule on specific event dates (e.g. Carnival runs Saturday timetable)
- `event_restriction` — removes specific timepoints on specific event dates (e.g. no service after 20:00 on New Year's Eve)

An **event** (`Event`) has its own `rules[]` array of `event_restriction` / `event_replacement` entries that apply globally to specific lines. Events also have a `dates[]` array.

Manual rules with an `event_id` field are **event-linked**: they only activate when the referenced event's `dates[]` contains the current operational date.

---

## Rule merging — `resolvePatternRules`

**File:** `packages/dates/src/calendar/rules/merging/index.ts`

```
resolvePatternRules(pattern, events) → ScheduleRule[]
```

Returns `[...pattern.rules, ...derivedRules]` where `derivedRules` are `event_restriction` and `event_replacement` rules extracted from each event's own `event.rules[]`, filtered by whether the event affects this pattern's line.

> Pattern-level manual rules (including event-linked excludes like MJTX0) are passed through unchanged. They are NOT derived from event.rules — they already live in pattern.rules.

---

## GO: computing active timepoints — `computeActiveRules`

**File:** `packages/dates/src/calendar/rules/calculation/index.ts`

```
computeActiveRules(date, allRules, periods, holidays, { events }) → { timepoints, appliedRuleIds }
```

**Algorithm for a normal (non-replacement) day:**

1. Filter manual rules to those that apply on `date`:
   - Non-event-linked: always kept
   - Event-linked (`rule.event_id` set): kept only if the referenced event's `dates[]` includes `date`

2. Filter by month (if `rule.months` is set)

3. Resolve `ctx = { weekday, yearPeriodId }` for the date

4. **`collectManualIncludes(rules, ctx)`** — collects timepoints from all `include` rules that match both `ctx.weekday` and `ctx.yearPeriodId` (strict AND). Returns `{ timepoints: Set, appliedRuleIds }`.

5. **`applyManualExcludes(timepoints, appliedRuleIds, rules, ctx)`** — for each `exclude` rule matching `ctx`, removes its timepoints from the set and pushes the rule's id to `appliedRuleIds`.
   - For event-linked rules: empty `weekdays`/`year_period_ids` = match all contexts (the date filter in step 1 already narrowed scope to event dates)

6. **`applyEventRestrictions(date, timepoints, appliedRuleIds, restrictionRules)`** — applies event_restriction rules whose `dates[]` includes `date`.

Result: the final operating timepoints for GO's schedule viewer and VKM calculation.

---

## GTFS exporter: computing service_id date sets

The GTFS exporter cannot just say "this trip runs on weekdays" — it must output an explicit list of calendar dates per service_id. It needs to know the exact date set for every (rule, timepoint) pair across the full export window, then assign canonical `service_id` tokens.

### Phase 1 — Accumulate include/exclude schedules

**File:** `modules/offer/apps/gtfs-exporter/src/exports/trips.ts` → `buildTimepointSchedules`

Iterates every date in the export window. For each date:

**`collectIncludeTimepointsForDate`** calls `collectGtfsIncludeContributionsForDate` (see below) and processes its contributions:
- `operating` contribution → add `(date, include, rule, timepoint)` to schedule buckets
- `base_off` contribution → add `(date, include, ownerRule, timepoint)` **and** `(date, exclude, excludeRule, timepoint)` — this is how event-exclude displacements are tracked

**`collectExcludeTimepointsForDate`** independently sweeps the applied rules:
- Manual `exclude` rules → add `(date, exclude, rule, tp)` for every `tp` in the rule
- Event restriction rules → add excludes for the timepoints they remove

---

### Phase 2 — GTFS attribution per date

**File:** `packages/dates/src/calendar/rules/export-attribution/index.ts` → `collectGtfsIncludeContributionsForDate`

For each date, determines *which rule owns each timepoint* in the GTFS sense.

**Normal day path → `collectNormalDayContributionsReconciled`:**

1. `operating = computeActiveRules(date, allRules, ...)` — the GO truth (which timepoints are active)
2. `calendarContributions = collectNormalDayContributions(monthFilteredManualRules, ctx)` — what the calendar rules *would* produce ignoring event excludes (include rules only, matched by weekday + period)
3. For each calendar timepoint:
   - If it's in `operating.timepoints` → emit `operating` contribution for that rule
   - Otherwise → call `findDisplacementExcludeRule(date, tp, allRules, operating.appliedRuleIds)` to find what excluded it → emit `base_off` contribution (include rule + exclude rule pair)
4. For operating timepoints not covered by any calendar rule (e.g. replacement-day extras) → emit `operating` on the owning rule

**`findDisplacementExcludeRule`:**
Searches `operating.appliedRuleIds` for:
1. A manual `exclude` rule whose `timepoints` list contains the timepoint
2. An `event_restriction` rule that covers the date and timepoint

**Replacement day path → `collectReplacementDayContributions`:**
Similar but uses the replacement rule's weekday/period targets to decide token ownership.

---

### Phase 3 — Merge subset includes

**File:** `modules/offer/apps/gtfs-exporter/src/exports/trips.ts` → `mergeSubsetIncludeSchedules`

If rule A's accumulated include dates at timepoint X are a strict subset of rule B's include dates at the same timepoint (and neither is event-specific or a replacement), A is absorbed into B. Prevents redundant trip rows.

---

### Phase 4 — Resolve final trip rows

**File:** `modules/offer/apps/gtfs-exporter/src/exports/trips.ts` → `resolveTripRows`

For each (timepoint, include rule):

1. **`splitOperationalDatesByExcludeOverlap`** — splits include dates into:
   - `plainOperationalDates` — dates with no overlapping exclude
   - `offOperationalDates` — dates where ≥1 exclude schedule also has that date

2. **Plain dates** → plain trip row (no canonical expansion; date set is exactly the accumulated plain dates)

3. **Off dates** → `computeOffRowDates`:
   - Expands include rule to canonical dates: `buildCanonicalRuleDates(includeRule, exportDates, ...)` walks all export dates and checks `manualRuleAppliesOnDate`. Returns all dates that the rule *would* cover by definition (weekday + period + months + event scope).
   - For each exclude rule: `buildCanonicalRuleDates(excludeRule, ...)` — **returns `new Set()` for non-include manual rules**; if empty, falls back to the exclude rule's accumulated dates.
   - `resultingDates = canonical_include − canonical_excludes`, capped to `allIncludeAccumulated`

4. Plain rows claim dates first; off rows only keep remaining unclaimed dates.

---

### Phase 5 — Service registry / token naming

**File:** `modules/offer/apps/gtfs-exporter/src/utils/service-registry.ts`

Date sets are hashed (SHA-256 of sorted dates). Same hash → same internal `SVC_xxxx` id.

`resolveRuleToken(ruleToken, internalId)` assigns human-readable names:
- First date set seen for token `ALL_DU` → `ALL_DU`
- Second distinct date set for same token → `ALL_DU 2`
- etc.

`registerServiceId(resolvedToken, dates)` writes the token → date set mapping used for `calendar_dates.txt`. Throws if the same token is registered twice with different date sets.

---

## Key difference: GO vs GTFS

| | GO (`computeActiveRules`) | GTFS (`buildTimepointSchedules`) |
|---|---|---|
| **Purpose** | Which timepoints run on a given date | Which dates each (rule, timepoint) pair runs across the whole export window |
| **Event-linked excludes** | Applied by `applyManualExcludes` when event.dates includes the date | Expected to produce `base_off` contributions via `findDisplacementExcludeRule`, which adds the date to both an include and an exclude bucket |
| **Output** | `{ timepoints[], appliedRuleIds[] }` for one date | Map of `(rule, mode, timepoint) → Set<OperationalDate>` across all dates |

Both call `computeActiveRules` internally (GTFS calls it inside `collectGtfsIncludeContributionsForDate` and `getAppliedRulesForDate`). If GO is correct for a date, `operatingTimepoints` is correct. The GTFS diverges when the *attribution* layer (`base_off` vs `operating`) or the canonical expansion step (`computeOffRowDates`) fails to propagate the exclusion to the final date set.

---

## Key files at a glance

| File | Key exports |
|------|-------------|
| `packages/dates/src/calendar/rules/merging/index.ts` | `resolvePatternRules` |
| `packages/dates/src/calendar/rules/calculation/index.ts` | `computeActiveRules` |
| `packages/dates/src/calendar/rules/calculation/filters.ts` | `applyManualExcludes`, `applyEventRestrictions`, `getTimepointsRemovedByEventRestriction` |
| `packages/dates/src/calendar/rules/calculation/matchers.ts` | `manualRuleMatchesContext` — empty weekdays/periods = match-all for event-linked rules |
| `packages/dates/src/calendar/rules/calculation/collectors.ts` | `collectManualIncludes` |
| `packages/dates/src/calendar/rules/export-attribution/index.ts` | `collectGtfsIncludeContributionsForDate`, `findDisplacementExcludeRule`, `collectNormalDayContributionsReconciled` |
| `packages/dates/src/calendar/rules/export-attribution/canonical-registry.ts` | `buildCanonicalRuleDates` — returns empty Set for exclude/non-manual rules |
| `packages/dates/src/calendar/rules/export-attribution/trip-row-dates.ts` | `computeOffRowDates`, `splitOperationalDatesByExcludeOverlap`, `resolveCanonicalDatesForRule` |
| `packages/dates/src/calendar/rules/export-attribution/collectors.ts` | `collectManualIncludesByRule` — include-only, per rule |
| `modules/offer/apps/gtfs-exporter/src/exports/trips.ts` | `buildTimepointSchedules`, `collectIncludeTimepointsForDate`, `collectExcludeTimepointsForDate`, `mergeSubsetIncludeSchedules`, `resolveTripRows`, `exportTripsForPattern` |
| `modules/offer/apps/gtfs-exporter/src/utils/service-registry.ts` | `ServiceRegistry` — hash-based dedup + token naming |
| `modules/offer/apps/gtfs-exporter/src/main.ts` | Orchestration — loads events via `fetchAllEvents`, passes `Array.from(allEventsMap.values())` to trip export |
