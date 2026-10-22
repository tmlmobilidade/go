# Pathways validation

`main.go` runs 12 presence checks and 10 standard checks through one row-scoped
RuleRunner action map. Checks read current SQLite values through `Pathways`.
Presence rules use `pathways_<field>_field`; standard checks use simplified rule IDs.
Configure dependencies explicitly with `depends_on`. Signage checks are now
presence-only field checks. Numeric parsing occurs inside the relevant value
check, so malformed values no longer suppress independent checks on the row.

Mode-dependent length/slope presence messages remain in field checks. Stop
references retain location-type/access checks, including the existing difference
in malformed-stop handling between origin and destination. Missing or malformed
pathway modes no longer cause nil-pointer panics.

Existing value semantics are preserved: stair_count uses an unsigned 16-bit
integer; min_width below one emits the recommendation; max_slope retains its
mode restriction and literal "0" exception. Wildcard options retain the previous
early return before the exit-gate direction check. No additional GTFS constraints
are introduced by this structural migration.

Mirrored tests use file-backed SQLite fixtures and verify severity, source rows,
missing/NULL values, options, references, and conditional behavior.
