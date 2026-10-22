# Transfers validation

`main.go` registers the prepared SQLite tables and runs one action map per
transfer row. Checks read current values through `db.Transfers`, with matching
reference lookups in stops, routes, and trips. There is no parsed transfer
snapshot or whole-row parser gate.

- `fields/checks`: eight presence checks using `transfers_<field>_field` IDs.
  Stop IDs are required for transfer types 1–3. Trip IDs are required for types
  4–5 and recommended otherwise. A missing route is not reported when its trip
  reference is present.
- `standard/checks`: eight checks retaining the existing value-rule IDs. These
  cover references, stop location types, distinct source/destination stops,
  trip/route consistency, transfer types 0–5 and configured options, and
  non-negative integer transfer times. Empty values belong to the field checks.
- `fields/tests` and `standard/tests`: mirrored SQLite fixtures covering missing
  columns, NULL/empty values, severity configuration, conditional requirements,
  reference mismatches and database failures.

The rule configuration's `depends_on` entries control prerequisite execution.
A failure affects only its source row; an invalid numeric field no longer
prevents independent checks from running on that row. Configure the new field
rules separately from the retained standard rules.

All current rules fit the field or standard categories, so no custom check
package is needed. Diagnostic translations are in `i18n-v2` for en/pt/es.

Run `go test ./validations/transfers/...` and `go build .` from the validator
`src` directory.
