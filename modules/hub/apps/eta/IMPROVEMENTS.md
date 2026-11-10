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

## Lifecycle and publication (#950)

Non-APPEND refreshable views atomically replace the complete target, so removed
rows do not accumulate between successful refreshes. `FINAL` alone only merges
versions; it is not an expiry policy. `publishable_trip_stop_etas` additionally
bounds generation age (90 s default), GPS age, confidence, completed rides and
passed stops. Every simplified/GTFS SQL reader uses this view. GTFS joins the
exact ride and preserves repeated stop sequences.

Snaps now carry the actual ride ID, with agency, vehicle assignment and local
04:00 service date checks; prediction state is keyed by ride+vehicle, avoiding
trip IDs shared by agencies or reused on consecutive days. Existing snap rows
with empty ride IDs age out; allow two minutes to warm after migration.

The simplified publisher reads one dataset, includes external feeds, writes
all/grouped keys with concurrency 25, then prunes missing groups within the
agency prefix. A failed write does not trigger pruning. One publisher must own
an agency. Cache TTL is 60 s (publisher cadence 15 s); during outages, stale
cache exposure is bounded to generation limit + TTL, approximately 150 s with
default policy. Cross-key Redis writes are not an atomic transaction.

The replacement target is `pred_trip_stop_etas_v2`, keyed by ride, vehicle and
stop sequence. Changing only ORDER BY on the populated legacy table would not
be a safe migration. The old table is retained for inspection/rollback; do not
read it from new publishers, and remove it only after the rollout is accepted.

## Historical support (#951)

Daily aggregates include count, p10/p50/p90 and population standard deviation.
Each day contributes once, weighted by seven-day exponential recency, calendar
similarity and min(count,20). Capping daily support limits one day's influence.
Five pseudo-observations shrink node estimates toward the shape/time prior;
absent shapes use the distance prior. Effective support and mixed dispersion
are exposed in `pred_node_etas`. Mixed daily p10/p90 are descriptive bounds,
not calibrated pooled quantiles or prediction intervals.

Existing aggregate rows default to zero support until rebuilt. Rebuild the
30-day aggregation window before enabling this view. Compare a temporally held
out replay with the saved incumbent snapshots; inspect sparse routes and P90.
Measure aggregation/refresh runtime and bytes read on a peak-sized dataset.

## Map-match quality (#952)

Live candidates now require the historical 30 m distance bound, correct moving
heading (circular difference <=90 degrees) and deterministic distance/node tie
breaks. Stationary headings are ignored. `curr_vehicle_events` stores match
distance, heading difference and confidence. `valid_vehicle_events` additionally
reports time gap, progression speed and position confidence; two physically
plausible observations confirm cold starts. A two-ping lookback recovers after
one forward spike. There is no permanent running-max progress latch. Gaps over
120 s require reconfirmation. Out-of-order arrivals are ordered by GPS time/ID.

Historical traversal filtering also caps gaps at 120 s and wraps angular
differences correctly. Historical labels use displacement heading, while live
matching uses vehicle bearing where reliable. Ambiguous self-intersections may
reduce coverage until forward movement disambiguates them; this is preferable
to inventing progress. Audit looping and parallel-road traces before promotion.
The existing stop snapper still needs route-specific review when the same
coordinates occur multiple times on one shape.

## Shared directional roads (#953)

Tangents are cached every 15 minutes and refreshed after shape loading, keeping
window calculations out of 15-second GPS batches. `road_segment_candidates`
provides deterministic geohash-7 / 15-degree directional review candidates.
Nearby parallel roads, intersections and bridges cannot be distinguished from
GTFS 2D coordinates alone, so candidate IDs NEVER enable traffic sharing.

Import `road_segment_assignments` from a road graph or review multi-line
corridors: exact shape/node, stable 100-250 m road ref, layer, road-v1 version,
approval and reviewer. `shape_node_road_segments` includes only approved rows;
its deterministic hash includes road ref, grade/layer, direction and version.
Different lines then share evidence only on the same approved directional road.
Opposite directions and bridge layers stay separate. The coverage query reports
the rollout gap. No reviewed road data was available in this repository; until
it is supplied, traffic features stay neutral and the baseline remains usable.
