# Rides Acceptor

Background worker in the **controller** module that creates and maintains `ride-acceptances` documents in MongoDB (`operation.ride-acceptances`) from ride + analysis data in ClickHouse.

## Purpose and responsibility

### What it does

On a fixed interval, the app:

1. Loads rides from the last **3 days** (by `start_time_scheduled`), in **2-hour chunks**, newest first — from ClickHouse via `labDb`.
2. Joins each ride with the latest required analysis results (also from ClickHouse).
3. For each ride, ensures a matching `RideAcceptance` document exists in MongoDB and reflects the current analysis outcome.
4. Optionally auto-fills a justification from a matching **alert** when an acceptance is in `justification_required` status.

It does **not** run ride analyzers, expose HTTP endpoints, or accept/reject rides manually. Those happen upstream (`rides-examiner`) or via the controller API.

### Where it fits

```text
rides-feeder          → creates/updates rides from plans
rides-examiner        → runs analyzers, writes analysis results (ClickHouse)
rides-acceptor        → creates/updates ride acceptances from ride analysis  ← this app
rides-locker          → locks ride acceptances after a retention window
controller API        → manual justify, status change, comments, lock/unlock
```

The acceptor is the bridge between **ride analysis grades** (ClickHouse) and **operational acceptance state** (MongoDB `ride-acceptances`).

### Problem it solves

Operations need a durable acceptance record per ride — whether analysis passed, whether justification is required, and whether an alert or operator provided context. The acceptor automates creation and refresh of those records for recently scheduled rides.

### Input ride vs acceptance outcome

| Term | Meaning in this app |
|---|---|
| **Input ride** | A `RideWithAnalyses` row from ClickHouse: `_id`, `operational_status` (derived), `route_short_name`, and `analysis` (map of required analysis results). |
| **Accepted ride** | A `RideAcceptance` with `acceptance_status: 'accepted'`. All required analyses have `grade === 'pass'`. |
| **Not accepted (automatic)** | `acceptance_status: 'justification_required'`. At least one required analysis does not have `grade === 'pass'`. This app never sets `'rejected'`. |
| **Under review** | `acceptance_status: 'under_review'` after alert-based auto-justification. |

> **Terminology note:** The type system defines `'rejected'` as a valid `acceptance_status`, but **this app never writes it**. Manual rejection is handled by the controller API (`changeStatus`).

---

## Ride acceptance rules

Rules are evaluated in `testRide()` (`src/test-ride.ts`). Only one analysis is required today:

```ts
REQUIRED_ANALYSES = ['simple_three_vehicle_events']
```

### Rule 1 — Operational status gate (create only)

`operational_status` is **derived in the ClickHouse query**, not read from a stored field:

| Condition | Derived status |
|---|---|
| Never seen (`seen_last_at` null) and start ≤ 10 min ago | `'scheduled'` |
| Never seen and start > 10 min ago | `'missed'` |
| Seen within last 10 min | `'running'` |
| Otherwise | `'ended'` |

| Condition | Result |
|---|---|
| `operational_status` is `'ended'` or `'missed'` | Continue to analysis evaluation |
| Any other status (`'running'`, `'scheduled'`) | **No acceptance created**; function returns silently |

**Scope:** Applies only in `createRideAcceptance()`. Updates do **not** re-check operational status.

**Why:** Only finished or missed rides should get an initial acceptance record.

### Rule 2 — Required analysis: `simple_three_vehicle_events`

| Check | Pass | Fail |
|---|---|---|
| `ride.analysis['simple_three_vehicle_events']?.grade === 'pass'` | Contributes to acceptance | Contributes to `justification_required` |

**What is validated:** The latest `grade_status` / `reason` from ClickHouse table `operation.ride_analysis_simple_three_vehicle_events` (via `argMax`), mapped into the ride's `analysis` map as `grade` / `reason`. The acceptor does **not** re-run the analyzer.

For rides still `'scheduled'` or `'running'`, the query forces analysis grades to `null` (so create is skipped by Rule 1 anyway).

**Missing or absent analysis:**

- Pass check: treated as **fail**.
- Summary stored: `{ grade: 'fail', reason: 'Required analysis missing: simple_three_vehicle_events' }`.

**Non-`'pass'` grades** (`'fail'`, `'skip'`, `'error'`, or any other value): treated as **fail** for acceptance purposes.

### Rule 3 — Composite acceptance decision

| All required analyses `grade === 'pass'` | `acceptance_status` |
|---|---|
| Yes | `'accepted'` |
| No | `'justification_required'` |

There is no partial acceptance. One failing required analysis is enough for `justification_required`.

### Rule 4 — Alert auto-justification

Runs **after** update, only when the **cached** acceptance (loaded at chunk start) has `acceptance_status === 'justification_required'`.

An alert must match **all** of:

| Field | Condition |
|---|---|
| `created_at` | ≥ 2 days ago (Europe/Lisbon) |
| `reference_type` | `'rides'` or `'lines'` |
| `references` | At least one element with `parent_id` in `[ride._id, ride.route_short_name]` |

If matched → update acceptance to:

- `acceptance_status: 'under_review'`
- `justification` populated from the alert (`cause`, `description`, `created_by`, timestamps)
- `justification_source: 'alert'`

If no alert matches → no change.

### Rule evaluation order

```text
1. [create only] operational_status gate
2. testRide() → accepted | justification_required
3. [existing acceptance only, if cached status was justification_required] alert lookup
```

Updates skip step 1 entirely. Create path does not attempt alert justification in the same iteration (no acceptance existed in the cache).

### Decision table

| Scenario | Acceptance created? | Final status (this run) |
|---|---|---|
| No acceptance, status `running` | No | — |
| No acceptance, status `ended`, analysis passes | Yes | `accepted` |
| No acceptance, status `ended`, analysis fails | Yes | `justification_required` |
| No acceptance, status `ended`, analysis missing | Yes | `justification_required` |
| Existing acceptance, summary unchanged | — | unchanged (no DB write) |
| Existing acceptance, summary changed, analysis passes | — | `accepted` |
| Existing acceptance, summary changed, analysis fails | — | `justification_required` |
| Cached status `justification_required`, matching alert | — | `under_review` |

---

## Processing flow

The app runs `main()` every **10 minutes** via `runOnInterval`. Each run processes timestamp chunks from **now − 3 days** to **now − 30 seconds**, split into **2-hour** intervals (newest first) via `performInTimeChunks`.

```mermaid
flowchart TD
    Start([Interval tick — every 10m]) --> Init[Init Sentry + Logger]
    Init --> Chunks[Build 2h time chunks<br/>last 3 days, newest first]
    Chunks --> FetchRides[ClickHouse: rides + required analyses]
    FetchRides --> FetchAcc[Mongo: bulk fetch acceptances by _id]
    FetchAcc --> Loop{For each ride}

    Loop --> HasAcc{Acceptance exists?}

    HasAcc -->|No| OpGate{operational_status<br/>ended or missed?}
    OpGate -->|No| Loop
    OpGate -->|Yes| TestCreate[testRide]
    TestCreate --> Insert[Insert RideAcceptance<br/>accepted or justification_required]
    Insert --> Loop

    HasAcc -->|Yes| TestUpdate[testRide]
    TestUpdate --> SummarySame{analysis_summary<br/>unchanged?}
    SummarySame -->|Yes| CheckAlert
    SummarySame -->|No| Update[Update acceptance status + summary]
    Update --> CheckAlert

    CheckAlert{Cached status<br/>justification_required?}
    CheckAlert -->|No| Loop
    CheckAlert -->|Yes| AlertLookup{Matching alert<br/>last 2 days?}
    AlertLookup -->|No| Loop
    AlertLookup -->|Yes| Justify[Set under_review + justification]
    Justify --> Loop

    Loop -->|Done all rides| NextChunk{More chunks?}
    NextChunk -->|Yes| FetchRides
    NextChunk -->|No| End([Run complete])
```

### Per-ride branch detail

```mermaid
flowchart LR
    subgraph createPath [Create path]
        C1[No acceptance] --> C2{ended or missed?}
        C2 -->|no| CX[Skip]
        C2 -->|yes| C3{grade === pass?}
        C3 -->|yes| CA[accepted]
        C3 -->|no| CJ[justification_required]
    end

    subgraph updatePath [Update path]
        U1[Has acceptance] --> U2{summary changed?}
        U2 -->|no| U3[No update]
        U2 -->|yes| U4{grade === pass?}
        U4 -->|yes| UA[accepted]
        U4 -->|no| UJ[justification_required]
    end

    subgraph alertPath [Alert path — uses cached status]
        A1[cached justification_required] --> A2{alert found?}
        A2 -->|yes| AR[under_review]
        A2 -->|no| AN[unchanged]
    end
```

---

## Examples

Examples reflect `testRide()` logic. Analysis objects are simplified to the fields the acceptor reads.

### Accepted

```json
{
  "_id": "ride-001",
  "operational_status": "ended",
  "route_short_name": "10",
  "analysis": {
    "simple_three_vehicle_events": { "grade": "pass", "reason": "ALL_STOPS_FOUND" }
  }
}
```

→ `acceptance_status: 'accepted'`, `analysis_summary` contains `{ grade, reason }` for the required analysis.

### Not accepted — analysis failed

```json
{
  "_id": "ride-002",
  "operational_status": "ended",
  "analysis": {
    "simple_three_vehicle_events": { "grade": "fail", "reason": "MISSING_MIDDLE_STOPS" }
  }
}
```

→ `acceptance_status: 'justification_required'`.

### Not accepted — analysis missing

```json
{
  "_id": "ride-003",
  "operational_status": "missed",
  "analysis": {}
}
```

→ `acceptance_status: 'justification_required'`, summary includes synthetic fail for `simple_three_vehicle_events`.

### No acceptance created — ride still active

```json
{
  "_id": "ride-004",
  "operational_status": "running",
  "analysis": {
    "simple_three_vehicle_events": { "grade": "pass" }
  }
}
```

→ No `RideAcceptance` document created. Will be picked up on a later run once status becomes `ended` or `missed`.

### Alert auto-justification

Precondition: acceptance already exists with `acceptance_status: 'justification_required'` **in the chunk's cached map** (see [Known discrepancies](#known-discrepancies)).

Alert:

```json
{
  "created_at": "<within last 2 days>",
  "reference_type": "rides",
  "references": [{ "parent_id": "ride-002", "child_ids": [] }],
  "cause": "CONSTRUCTION",
  "description": "Detour in effect",
  "created_by": "operator-1"
}
```

→ `acceptance_status: 'under_review'`, `justification.justification_source: 'alert'`.

### Edge case — update skipped

If `analysis_summary` serializes identically to the stored summary (`JSON.stringify` comparison), no DB update occurs even if `acceptance_status` on the stored document differs from what `testRide()` would compute.

### Edge case — alert one cycle late

If a ride **newly** fails on this run (update sets `justification_required`), alert justification does **not** run in the same iteration because the cached map still holds the previous status. It runs on the **next** 10-minute cycle if status remains `justification_required`.

Newly created acceptances in `justification_required` also skip alert justification in the create iteration (create path `continue`s before the alert check).

---

## Technical details

### Source layout

| File | Responsibility |
|---|---|
| `src/index.ts` | Interval loop, `performInTimeChunks` orchestration |
| `src/process.ts` | Per-chunk: fetch rides/analyses + acceptances, create/update/alert loop |
| `src/create-ride-acceptance.ts` | Insert new acceptance (with operational status gate) |
| `src/update-ride-acceptance.ts` | Update acceptance when analysis summary changes |
| `src/alert-justification.ts` | Alert lookup and auto-justification |
| `src/test-ride.ts` | `testRide()` — evaluate required analyses |
| `src/types/ride-with-analyses.ts` | `RideWithAnalyses`, `REQUIRED_ANALYSES` |
| `src/queries/build-rides-with-analyses-query.ts` | Builds ClickHouse SQL joining rides + analysis tables |
| `src/queries/rides-with-analyses-query.ts` | Compiled query for the current `REQUIRED_ANALYSES` |

There are **no tests** in this package.

### Input / output types

**Input:** `RideWithAnalyses` from ClickHouse (`labDb.queryFromString`):

```ts
{
  _id: string
  operational_status: OperationalStatus  // derived in SQL
  route_short_name: string
  analysis: Partial<Record<RequiredAnalysis, { grade, reason }>>
}
```

**Output:** `RideAcceptance` documents in MongoDB. Acceptance `_id` equals the ride `_id`:

```ts
{
  _id: string  // same as ride._id
  acceptance_status: 'accepted' | 'justification_required' | 'under_review' | 'rejected'
  analysis_summary: Record<string, { grade: GradeStatus; reason: string | null }>
  justification: RideJustification | null
  overrides: { trip_id: string | null }
  comments: []
  is_locked: false          // on create
  created_by: 'system'       // on create
}
```

### Events and messaging

None. The app is a polling worker — no queues, webhooks, or pub/sub.

### External dependencies

| Dependency | Usage |
|---|---|
| `@tmlmobilidade/go-interfaces-labdb` | ClickHouse: rides + `ride_analysis_*` tables |
| `@tmlmobilidade/go-interfaces-godb` | MongoDB: `operation.rideAcceptances`, `operation.alerts` |
| `@tmlmobilidade/go-types-operation` | `RideAcceptance` types / schema |
| `@tmlmobilidade/go-utils-dates` | Europe/Lisbon timestamps for chunks and alert window |
| `@tmlmobilidade/go-utils-exec` | `runOnInterval` (10m), `performInTimeChunks` (2h) |
| `@tmlmobilidade/logger` | Logging + Sentry bootstrap |
| `@tmlmobilidade/timer` | Per-chunk / global timing |

### Configuration

All constants are hard-coded — **no environment variables** in this app (Sentry / DB clients may read env vars via their own init).

| Constant | Value | Location |
|---|---|---|
| Sync window | 3 days | `SYNC_DAYS_BACK` in `index.ts` |
| Run interval | 10 minutes | `runOnInterval(..., { intervalMs: '10m' })` |
| Chunk size | 2 hours | `performInTimeChunks({ intervalHrs: 2 })` |
| Upper bound offset | 30 seconds before now | avoids very recent rides |
| Alert lookback | 2 days | `alert-justification.ts` |
| Required analyses | `simple_three_vehicle_events` | `types/ride-with-analyses.ts` |
| Timezone | `Europe/Lisbon` | chunk boundaries and alert filter |

### Side effects

- **Inserts** into MongoDB `operation.ride-acceptances` for new ended/missed rides.
- **Updates** existing acceptances when `analysis_summary` changes.
- **Updates** to `under_review` + `justification` when a matching alert is found.
- **Reads** from ClickHouse `operation.rides` and `operation.ride_analysis_*`.
- **Logging** at info/error level per operation.
- Per-ride errors are caught and logged without stopping the chunk.

### Error handling

| Layer | Behavior |
|---|---|
| `createRideAcceptance` / `updateRideAcceptance` / `alertJustification` | `try/catch` — log error, continue with next ride |
| `main()` top-level | Log error; interval continues on next tick |
| Sentry init failure | Logged; app continues |

### Downstream interactions

- **`rides-locker`** locks acceptances (`is_locked: true`) after a separate retention window.
- **Controller API** (`/ride-acceptance/*`) handles manual justify, status changes, comments, and lock toggles — independent of this worker.

---

## Known discrepancies

These are present in the current implementation. Documented as-is, not as intended design.

1. **`performInTimeChunks` is not awaited** in `main()` — the "Finished running" success log can fire before chunks complete, and chunk failures are not caught by the top-level `try/catch`.

2. **Alert path uses stale cached status** — after `updateRideAcceptance()` may set `justification_required`, alert lookup still reads the pre-update status from `acceptanceMap`. New failures get alert justification one cycle later. Newly created acceptances also skip alert justification until the next cycle.

3. **No `'rejected'` path** — failed analyses produce `justification_required`, not `rejected`. Rejection is only via manual API action.

4. **Error log message says "Halting execution"** in create/update/alert handlers, but execution continues with the next ride.

---

## Running locally

```bash
# from modules/controller/apps/rides-acceptor
pnpm dev    # tsx watch
pnpm start  # node dist/index.js (after build)
```

Requires ClickHouse access via labdb, MongoDB access via godb, and ride/analysis rows covering the sync window.
