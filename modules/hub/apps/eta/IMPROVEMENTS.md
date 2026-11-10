# ETA improvement rollout

Parent: #945. Feature PRs target `feat/945-eta-improvements`. Apply them in issue
order: each branch includes the prerequisite commits, so later PR diffs shrink
as earlier PRs merge. The parent remains separate from `prd` until review.

## Measurement (#946)

`prediction_snapshots` appends each successful 30-second prediction generation.
Its key includes ride, vehicle and stop **sequence**; a repeated stop on a loop
is a separate observation. `generated_at` is the computation clock,
`position_created_at` the GPS clock, `position_received_at` the ingestion clock,
and `captured_at` the snapshot clock. `publication_runs` is reserved for successful
publisher writes; capture time must never be described as publication time.

Retention is 35 days, partitioned daily. At N upcoming vehicle/stop pairs the
budget is N × 2,880 rows/day before compression. Restrict enabled agencies and
the current-ride window rather than adding passenger/device dimensions. Monitor
`system.parts` compressed bytes and the health query before extending retention.
Readers deduplicate `(ride_id, vehicle_id, stop_sequence, generated_at, version)`
if a refresh is manually retried. Bootstrap creates/extends tables; it must never
truncate the ETA database. Production schema changes are applied explicitly,
before replacing the corresponding views.

Accuracy metrics require independent arrival labels (#947); empty datasets must
report missing coverage, never claim zero error. Real trace validation, peak-load
timing and shadow accuracy are rollout gates, not assertions inferred from tests.

## Independent arrival labels (#947)

A minute job interpolates plausible forward GPS crossings (<=120 s gaps,
<=120 km/h) into `actual_arrivals`. These are `crossing_only`, confidence 0.7;
they prove a passage, not boarding or an open door. Gaps stay `unobservable`.
The optional `verified_stop_events` ingestion table accepts authoritative door
observations (>=0.8), which supersede GPS. No door adapter is assumed to exist.
Labels wait two minutes for late events, keep their first known-at time on
replay, and never join stops by ID alone: ride+vehicle+sequence handles loops.
Stops never crossed have no label and count against label coverage. Route
deviations and GPS gaps are excluded from scored errors, not silently imputed.

Run `observability/prediction-errors.sql` with millisecond `since`/`until` bounds.
Positive signed error means late predictions; errors join labels strictly after
prediction time. Audit a sample of real traces (including loops and skipped
stops) and report label coverage before using GPS crossings for promotion.

## Missing history (#948)

Remaining geometry, not the available statistical rows, drives the node scan.
Missing/nonpositive/nonfinite estimates use a +/-4-node local prior, then the
shape/time prior, then 4 m/s over each 25 m chunk. Direct-history coverage is
stored with the prediction (fallbacks do not masquerade as measured support).
A missing cumulative stop match uses positive remaining distance; only a stop at
the current node may have a zero ETA. Durations outside UInt16 are suppressed
rather than wrapping. Public fields retain their existing types.

## GPS freshness (#949)

`runtime_policy` defaults to fresh <=60 s, aging <=180 s, ingestion lag <=120 s
and future-clock tolerance 5 s. Configuration is versioned and bounded by the
`policy` view; tune from operator latency distributions. Older fixes are
suppressed. Aging predictions expose exponential confidence decay. Remaining
time extrapolation is capped at 30 s and weighted by freshness, with a positive
floor for stops ahead; geometry is never advanced through unobserved turns.
Prediction clocks anchor at refresh time. Set max_extrapolation_seconds=0 to
disable. Publication filtering is centralised in #950. The health query exposes
GPS age, lag and suppression; these defaults require a latency-distribution
review before production promotion.
