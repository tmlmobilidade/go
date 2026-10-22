# Frequencies validation

`main.go` registers ten checks in a single row-scoped RuleRunner action map.
Checks read current SQLite values through `SQLiteContext.Frequencies`. The
unused raw-frequency cache and whole-row parser have been removed.

- `fields/checks`: presence for trip_id, start_time, end_time, headway_secs,
  and exact_times, using `frequencies_<field>_field` IDs.
- `standard/checks`: trip references, time format, positive headways, and
  exact_times enum/options, using the simplified value-rule IDs.
- Mirrored tests use file-backed SQLite fixtures. Runner tests live in `tests`.

Presence and values are independently configurable. Declare dependencies with
`depends_on`; findings block dependents only on the current row. Numeric parse
failures belong to their value check and do not suppress independent checks.

Existing semantics are preserved: times use `lib.ValidateTime`, headways must be
positive integers, and exact_times accepts 0/1 with configured options. Despite
legacy rule names, there are no headway/trip alignment, fixed-trip restrictions,
interval ordering, or overlap checks in this migration. The exact_times options
message now receives a string matching its translation placeholder.
