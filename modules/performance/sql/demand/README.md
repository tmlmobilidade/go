# Passenger Demand SQL

Canonical table schemas live in `packages-new/interfaces/labdb`. These files
operate on those tables; they are not a second source of truth for application
DDL.

## Files

- `by-agency-by-operational-date.sql`: legacy agency/day materialization.
- `rebuild-passenger-demand-by-dimensions-by-day.sql`: stage and atomically
  publish a complete rebuild.
- `refresh-recent-passenger-demand-by-dimensions-by-day.sql`: reconcile the
  rolling seven operational dates, one affected monthly partition per run.
- `reconcile-passenger-demand-by-dimensions-by-day.sql`: report source/fact
  differences for a bounded date range.
- `benchmark-existing-demand-metrics.sql`: benchmark existing metric shapes
  against the daily-dimensional fact.

See `modules/performance/docs/passenger-demand-daily-storage-strategy.md` for the
ownership model, refresh cadence, atomicity guarantees, and migration plan.
