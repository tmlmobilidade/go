# Levels validation

`main.go` registers five checks in one row-scoped RuleRunner action map. All
values are read directly through the existing `SQLiteContext.Levels` binding.

- `fields/checks`: presence under `levels_level_id_field`,
  `levels_level_index_field`, and `levels_level_name_field`.
- `standard/checks`: unique IDs (`level_id_unique`) and non-negative float32
  indices (`level_index_required`), preserving the existing value-rule IDs.
- Mirrored check tests and runner tests use real file-backed SQLite fixtures.

Configure presence separately from values; the old presence-only `level_name`
rule is replaced by `levels_level_name_field`. Declare dependencies explicitly
with `depends_on`; their outcomes are local to each row. Malformed indices are
reported by the index check instead of discarding the entire parsed row.

The existing non-negative index restriction is preserved. This migration does
not add ordering, index uniqueness, or additional numeric constraints.
