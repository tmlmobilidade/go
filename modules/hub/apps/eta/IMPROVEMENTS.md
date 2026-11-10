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
