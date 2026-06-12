# GTFS export attribution — scenarios & standards

This document is the **source of truth** for how scheduling rules become GTFS `service_id` tokens, `calendar_dates.txt`, and `trips.txt` rows. Implementation must match these scenarios; tests should cite scenario IDs (e.g. `FR-03`).

## Core principles

### P1 — One circulation per pattern × timepoint × day

On any operational date, a pattern may have **at most one active trip** per timepoint when joining `trips` × `calendar_dates`.

Duplicates (e.g. plain `FER-VER_DU` and `DIA_CARN` both active on Carnival) are **bugs**.

### P2 — Calendar membership ≠ operational binding

| Layer | Meaning | Example |
|-------|---------|---------|
| **Calendar membership** | When a **token** is defined in the period/weekday sense | `FER_DU` includes all FER weekdays in the export window, including Carnival Tuesday `20260217` |
| **Operational binding** | Which **trip row** runs on a given date | On `20260217`, `09:00` runs `DIA_CARN`, not plain `FER-VER_DU` |

`calendar_dates.txt` may list `20260217` on token `FER_DU` (membership).  
Trip `pattern|FER-VER_DU|0900` must **not** be active that day if the bus runs the replacement schedule.

**Consumer rule:** `FER_DU` (and similar period tokens) in `calendar_dates.txt` means “all weekdays in the FER period for this export” — the **definition** of the service. What actually runs on date D is determined by **`trips.txt`** (plain token, `BASE-OFF-EVENT`, or event token). Never infer active circulations from `calendar_dates.txt` alone.

### P3 — OFF tokens express “base except event”

When a manual base rule would match the calendar day but the **replacement schedule** runs instead, the base is exported as:

```text
{BASE}-OFF-{EVENT}
```

Service dates = canonical `{BASE}` minus canonical `{EVENT}` dates.

Examples: `FER-VER_DU-OFF-DIA_CARN` is valid and expected (FR-01, FR-03).

The replacement is a **separate** trip row:

```text
{EVENT}
```

Service dates = event dates only (e.g. `DIA_CARN` → `20260217`, `20260221`).

### P4 — No duplicate suffixes (`FER_DU 2`)

Same token name must not map to different date sets. Canonical definitions deduplicate `service_id`; operational binding (P1) decides per-trip activity.

### P5 — Count circulations like the rules engine

**Circulations on date D** = `|{ timepoints t : exactly one trip active for (pattern, t, D) }|`.

Typically equals `computeActiveRules(D).timepoints.length` for that pattern.  
Do **not** count every trip row whose calendar token includes D.

### P6 — Per-timepoint operational dates

When two trip rows share a timepoint but different tokens (e.g. `ALL_SAB|0715` and `DIA_CARN|0715`), **service dates are disjoint per row**:

- `DIA_CARN` → event dates where replacement operates at that timepoint.
- `ALL_SAB` (or other base manual) → remaining dates in its canonical set (e.g. Saturdays **excluding** forced-retarget event dates at that timepoint).

Subtract event/replacement dates **per timepoint**, not globally for the whole pattern.

---

## Replacement modes

Configured on **event replacement** rules (`same_weekday` in Dates UI).

| Mode | UI | `isForcedRetargetDay` |
|------|-----|------------------------|
| **Forced retarget** | “Mesmo dia da semana” **off**; pick target weekday(s) | Calendar weekday ∉ replacement `weekdays` (e.g. Tuesday → Saturday) |
| **Same weekday** | “Mesmo dia da semana” **on** | false on event dates |

---

## Forced retarget scenarios (Carnival-style)

**Setup (shared):** Event `DIA_CARN` on `20260217` (Tue), `20260221` (Sat). Replacement targets **Saturday**. Export window includes Feb 2026.

### FR-01 — Weekday-only timepoint (not in replacement schedule)

| | |
|--|--|
| **Rules** | `FER-VER_DU` includes `06:40` (weekdays). Saturday / replacement includes `06:45` only. |
| **On `20260217`** | Bus does **not** run `06:40`. Replacement runs from `06:45`. |
| **Trip rows** | `pattern\|FER-VER_DU-OFF-DIA_CARN\|0640` |
| **Active on `20260217`?** | **No** |
| **Circulations** | 0 at `06:40`; replacement timepoints count separately |

### FR-02 — Replacement-only timepoint (Saturday, no weekday owner)

| | |
|--|--|
| **Rules** | `ALL_SAB` / replacement includes `07:15`. No weekday rule at `07:15`. |
| **On `20260217`** | Runs Saturday schedule at `07:15`. |
| **Trip rows** | **`pattern\|ALL_SAB\|0715`** and **`pattern\|DIA_CARN\|0715`** (both exist in the export) |
| **`ALL_SAB\|0715` dates** | Saturdays in window **minus** dates where `DIA_CARN\|0715` is active (includes `20260221`, excludes forced-retarget `20260217`) |
| **`DIA_CARN\|0715` dates** | Event dates where replacement operates (`20260217`; not natural Saturday `20260221` unless that day uses replacement — see FR-05) |
| **Active on `20260217`?** | **`DIA_CARN\|0715` only** — not `ALL_SAB\|0715` |
| **Circulations** | 1 at `07:15` |

Not “`ALL_SAB` **or** `DIA_CARN`” — **both tokens**, with disjoint operational date sets (P6).

### FR-03 — Shared timepoint (weekday owner **and** replacement schedule)

| | |
|--|--|
| **Rules** | `FER-VER_DU` includes `09:00`. Replacement Saturday set also includes `09:00`. |
| **On `20260217`** | Runs **replacement** schedule at `09:00`, not weekday `FER-VER_DU`. |
| **Trip rows** | `pattern\|FER-VER_DU-OFF-DIA_CARN\|0900` **and** `pattern\|DIA_CARN\|0900` |
| **Active on `20260217`?** | Only `DIA_CARN\|0900` — **not** plain `FER-VER_DU\|0900` |
| **Circulations** | 1 at `09:00` |

**Anti-pattern (rejected):** `FER-VER_DU\|0900` + `DIA_CARN\|0900` both active on `20260217` because `FER-VER_DU` calendar includes that date → **duplicate** (violates P1).

This is **not** FR-04 (replacement differs from weekday-only path → OFF + event row required).

### FR-04 — Schedule unchanged (replacement equals existing manual)

| | |
|--|--|
| **Rules** | One calendar weekday manual’s timepoints match **`computeActiveRules(D)` exactly** on the event date (same set, same owner). |
| **On `20260217`** | Operating schedule already described by existing manuals; no separate replacement trip needed. |
| **Preferred export (A)** | Existing manual tokens only (e.g. `FER_DU`, `ALL_SAB`) — **no** `DIA_CARN`, **no** OFF variants |
| **Discouraged export (B)** | `FER_DU-OFF-DIA_CARN`, `DIA_CARN`, `ALL_SAB`, … — operationally equivalent, more rows |
| **Implementation** | Prefer **A** (`shouldEmitReplacementOnForcedRetarget` → false). Use **B** only if **A** cannot be guaranteed without regressions. |
| **Circulations** | Same as `computeActiveRules(D)` for that pattern |

### FR-05 — Natural Saturday on event weekend

| | |
|--|--|
| **Date** | `20260221` (Saturday) |
| **On `20260221`** | Not forced retarget; use Saturday manuals. |
| **Trip rows** | `ALL_SAB` / period tokens — **no** `DIA_CARN` unless Saturday explicitly runs replacement-only schedule |
| **Circulations** | Saturday rules only |

---

## Same-weekday scenarios

### SW-01 — Event date uses calendar weekday rules

| | |
|--|--|
| **Config** | `same_weekday: true` |
| **On event Tuesday** | Manual Tuesday rules; replacement intersection uses Tuesday |
| **Trip rows** | Manual tokens only (e.g. `FER_DU`); no `DIA_CARN` row |
| **OFF tokens** | Only where normal displacement applies (`event_id` on manuals) |
| **ND-03** | Same as normal days: one owner per shared timepoint among overlapping general manuals. The broader rule wins when its dates contain the other's (e.g. `ALL_DU-SAB` (Mon–Sat) owns `21:00` over `ALL_DU` (Mon–Fri) on `20260216`) |

---

## Normal day scenarios

### ND-01 — Plain weekday

| | |
|--|--|
| **Trip rows** | `FER-VER_DU`, `ESC_DU`, etc. |
| **OFF** | None |

### ND-02 — Event-specific manual displaces general manual (same timepoint)

| | |
|--|--|
| **Trip rows** | `{EVENT}_…` operating + `{GENERAL}-OFF-{EVENT}` via `base_off` |
| **On event date** | Event-specific timepoint active; general row excluded |

### ND-03 — Overlapping general manuals (same timepoint, same day)

| | |
|--|--|
| **Setup** | Two+ general `include` manuals match the same weekday×period (e.g. `ESC_DU` school + `ESC-VER_DU` “2 períodos”) and both list `20:30`. |
| **Rules engine** | One timepoint `20:30`; both rule IDs in `appliedRuleIds`. |
| **Export** | **One** `operating` row at `20:30` (P1); **no** `base_off` for the other general on that timepoint. **Owner = the broader rule** when one rule's applicable dates strictly contain the other's (`weekdays`/`year_period_ids`/`months` all ⊆) — keeps its date set whole and emits one token instead of fragmenting. For equal or partially-overlapping scopes (like `ESC_DU` vs `ESC-VER_DU`, same weekday×period), the choice is ambiguous, so owner = manual with **more timepoints** (primary schedule), then `_id`. |
| **Broader-wins example** | "all days `14:55`" + "weekdays `…14:55…`" share `14:55`. The all-days rule strictly contains the weekday rule, so it owns `14:55` on every day → one `ALL` token, not `ALL`(weekends) + `ALL_DU`(weekdays). |
| **Unique timepoints** | Timepoints only on the secondary manual (e.g. `15:55`) still get their own `operating` row. |
| **Anti-pattern (rejected)** | `ESC-VER_DU-OFF-ESC_DU` at `20:30` with neither plain `ESC_DU` nor plain `ESC-VER_DU` active on a day both apply (e.g. `20260105`). |

### ND-05 — Event manual vs weekend general (Santo António)

| | |
|--|--|
| **Setup** | `ALL_SAB-DOM` runs every weekend; `SANTOS` event manual shares 27 timepoints on Santo António only. |
| **On event Saturday** | `computeActiveRules` = full weekend set (40); at `06:05` event displaces general. |
| **Export** | `SANTOS\|0605` **operating** on event dates; `ALL_SAB-DOM-OFF-SANTOS\|0605` for non-event weekends; plain `ALL_SAB-DOM` for timepoints only on the general rule. |
| **Anti-pattern (rejected)** | `mergeSubset` drops event include because general dates strictly superset event dates → no `SANTOS` trip on `20260613` (only 13 plain weekend-only rows active). |

### ND-04 — Plain operating row vs OFF row at same timepoint

| | |
|--|--|
| **Setup** | Plain manual operates on school weekdays (e.g. `ESC_DU|1000`); Carnival path also builds `ALL_DU-OFF-DIA_CARN|1000` from `base_off` on event dates. |
| **Bug (rejected)** | `resolveTripRows` expands OFF to **canonical** `ALL_DU` − `DIA_CARN` for the **whole** rule×timepoint bucket when exclude overlap exists on **any** day → OFF row active on unrelated weekdays (e.g. férias `20260615` while exclude only on `20261224`). |
| **Export** | Split include dates **per day**: plain row = operational dates with no exclude on that day; OFF row = canonical base − event for days where `base_off` fired. Plain row **claims** dates first at resolve time. |
| **Example** | `1211_0_1` on `20260105` at `10:00`: only `ESC_DU` active; no `ALL_DU-OFF-DIA_CARN`. |

---

## Event restriction scenarios

### ER-01 — Restriction removes timepoints from operating set

| | |
|--|--|
| **Rules** | `event_restriction` on a date removes one or more timepoints from `computeActiveRules(D)` |
| **Export** | Follow operating set from rules engine; no trip row for removed timepoints |
| **Circulations** | `computeActiveRules(D).timepoints.length` (P5) |

### ER-02 — Event manual exclude zeroes all timepoints on event date (A2_24 dezembro)

| | |
|--|--|
| **Setup** | General weekday manuals (`ALL_DU`, `FER-VER_DU`, …) match the calendar day. Event-linked **exclude** manual (`event_id`, `operating_mode: exclude`) lists the event day’s timepoints and fires on `20261224`. |
| **Rules engine** | `computeActiveRules` = **0** timepoints; exclude rule appears in applied rules. UI may still list the exclude manual under “Regras Aplicadas” with its timepoint count — that is the **removed** set, not active circulations. |
| **Export attribution** | **0** `operating`; `base_off` pairs only (`BASE` displaced by event exclude). |
| **Trip rows** | **No plain row** active on the event date (P5). `resolveTripRows` must not leave that date in plain `plainOperationalDates`. |
| **GTFS calendar trap** | Trips use shared `service_id` tokens (`ALL_DU 2`). If another pattern registers `ALL_DU 2` with a calendar that still includes the event date, comparator counts this pattern’s trips on that date even when per-pattern resolve excluded it. Different date hashes must get disambiguated suffixes (`ALL_DU 2 2`) via `resolveRuleToken`. |
| **Example** | `2725_0_2` on `20261224`: 0 in GO, 45 wrongly in comparator when `ALL_DU 2` calendar still lists `20261224`. |

---

## `calendar_dates.txt` vs `trips.txt`

| File | Carries |
|------|---------|
| `calendar_dates.txt` | **Calendar membership** per `service_id` (canonical dates for the token) |
| `trips.txt` | **Operational binding** per `pattern\|token\|timepoint` |

A date may appear on service `FER_DU` in `calendar_dates.txt` while no trip with plain `FER_DU` is active that day (because the trip uses `FER_DU-OFF-DIA_CARN` or only `DIA_CARN` runs).

`FER_DU` in `calendar_dates.txt` should list **all FER-period weekdays** in the export window. Downstream tools that need “what runs on D” must join **`trips.txt`** (and OFF/event variants), not assume every `FER_DU` calendar date runs a plain `FER_DU` trip.

---

## Pattern 1248_0_1 on `20260217` (reference)

Expected circulations ≈ **16** = replacement operating timepoints (`DIA_CARN` set), not 45.

| Cause of inflation | Standard |
|--------------------|----------|
| Plain `FER-VER_DU` active on Carnival | Use `FER-VER_DU-OFF-DIA_CARN` (FR-01, FR-03) |
| Plain `FER-VER_DU` + `DIA_CARN` both active at same time | FR-03 anti-pattern |
| Canonical dates on plain rows without OFF | P2 / P3 — OFF path required |
| Counting rows whose calendar includes D | P5 — use `computeActiveRules` |

---

## Implementation checklist

- [ ] Forced retarget + replacement emitted: operating = **replacement only**; weekday owner → **`base_off`**, not `operating` owner (FR-03).
- [ ] Calendar-only weekday timepoints → **`base_off` only** (FR-01).
- [ ] Saturday-only replacement timepoints → **`ALL_SAB` + `DIA_CARN`** with disjoint dates (FR-02, P6).
- [ ] FR-04: prefer existing manuals only (**A**); skip `DIA_CARN` when sole owner covers operating set.
- [ ] `resolveTripRows`: canonical dates **only** when OFF excludes exist; else operational accumulation.
- [x] ND-03: overlapping generals → primary schedule `operating` only; no same-day `base_off`.
- [x] ND-04: plain row claims dates before OFF canonical expansion at same timepoint.
- [x] ND-05: `mergeSubset` must not absorb event-specific includes into general weekend rows.
- [x] ER-02: event exclude manual zeroes operating on event date; no plain trip active (P5).
- [ ] Tests reference scenario IDs in this file.

---

## Product decisions (resolved)

| Topic | Decision |
|-------|----------|
| **`ALL_SAB` vs `DIA_CARN` at same timepoint** | **Both** rows: `ALL_SAB` for non-event Saturdays; `DIA_CARN` for forced-retarget event dates (FR-02, P6). |
| **`FER_DU` in `calendar_dates`** | Full FER-period weekday membership; operational reality from `trips.txt` / OFF variants (P2 consumer rule). |
| **FR-04 when schedule unchanged** | Prefer **A** (manuals only); **B** (OFF + `DIA_CARN`) discouraged. |
| **Event restrictions** | ER-01 — follow `computeActiveRules`. |
