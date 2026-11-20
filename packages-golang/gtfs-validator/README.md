# GTFS validator

Imports a local GTFS ZIP or HTTP(S) URL through `import-gtfs` into an isolated,
temporary SQLite database, then executes the configured rules. The database and its
sidecar files are removed after success, validation failure, or operational failure.
Requires Go 1.26 and a C compiler for the SQLite driver.

The agency rules are implemented. The other table checks currently
return success as placeholders.

## CLI

```sh
go build -ldflags=-w -o dist/gtfs-validator ./src/cli.go
./dist/gtfs-validator -path ./gtfs.zip -rules ./rules.json -result ./result.json -concurrency 1
./dist/gtfs-validator -url https://example.com/gtfs.zip -rules ./rules.json -result ./result.json
```

Provide exactly one of `-path` or `-url`. The required `-rules` file holds a nonempty
JSON array. Each entry has a `rule_id` and `severity`. It can also supply
`depends_on` and `options` arrays of strings and a `compare` array of
`{"key":"…","value":"…"}` objects.

```json
[
  {"rule_id": "agency_file_exists", "severity": "error"},
  {"rule_id": "agency_email_exists", "severity": "error", "depends_on": ["agency_file_exists"]},
  {"rule_id": "agency_email_valid", "severity": "warning", "depends_on": ["agency_file_exists"]}
]
```

Agency field rules enforce GTFS-required fields at every active severity.
For an optional field, use `error` severity on its `_field` rule to require
the column and a value on each row. GTFS requires `agency_id` when there are
multiple agencies. Configure agency field rules with `agency_file_exists` in
`depends_on`.

`agency_id_valid` and `agency_name_valid` accept all supplied values by default.
Set `options` to allow specific values or use `all_options` to allow all values.
`agency_id_matched_with_agency_name` uses `compare` entries whose `key` is the
agency ID and whose `value` is the agency name.

`-concurrency` defaults to 1 and must be positive. SQLite uses one connection,
so concurrent rules still serialize database queries.

Provide `-result` with the path to the JSON report. The CLI writes this file
for completed runs and operational failures. Diagnostics go to stderr.

- `0` for a run with no error findings or for help.
- `1` for a run with error findings.
- `2` for invalid arguments or rules, or for a failure importing, validating, or writing output.

The `Summary` report contains grouped `RuleMessage` objects in `messages`, plus
`total_errors` and `total_warnings`. Each group contains detail `Message` objects,
field, filename, description, rule ID, severity, and distinct affected row count.
The report service in `src/services/report.go` retains at most 100 detail messages
per group and 100 rows per detail. Totals count distinct diagnostics before sampling;
row counts include all distinct collected rows. Zero-based input rows become CSV
line numbers (index + 2 for the header). Findings without source rows use `rows: []`.
A run without findings produces `messages: []`. Argument and rule configuration
errors are written to stderr before any report is emitted.

Severities are `ignore`, `info`, `warning`, `error`, and `forbidden`. Ignored findings
are omitted. Info findings are retained without increasing totals. Error and
forbidden findings contribute to `total_errors`. Warnings contribute to
`total_warnings`.

### Execution visualization

```sh
./dist/gtfs-validator -path ./gtfs.zip -rules ./rules.json -result ./result.json \
  -concurrency 4 -trace ./validation-trace.json
```

Open [visualization.html](visualization.html) in a browser and select or drop
`validation-trace.json`. The viewer opens on the full dependency chart in its
final state. Use playback, the event log, or the timeline to inspect earlier
steps. Select a rule to see its configured severity, observed outcome, queue
and run time, finding count, and any blocking prerequisites.

The version 1 trace includes the configured rule graph and the recorded run
events. Each event has a monotonic `elapsed_ns` offset from the UTC `started_at`.
Events cover graph setup, feed import, indexes, rule validation, report
collection, and cleanup. The rule events track readiness, start, result, and
reason for skipping. Finding counts are the diagnostics returned by a rule
before report deduplication and sampling. Playback advances event by event and
shows the recorded time for each step.

Once a valid graph exists, the CLI saves the trace even if import, execution,
or cancellation aborts the run. The trace records cancellation when it occurs.
The importer finishes its current import before the validator checks for
cancellation. If the trace cannot be saved, the CLI reports the write error
on stderr and exits with code `2`. The CLI writes the report and trace independently.

## Go library

```go
import (
    "context"

    validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
    "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
    importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

report, err := validator.GtfsValidator(context.Background(), validator.Options{
    Source: importgtfs.ImportGtfsConfigSource{Path: "./gtfs.zip"},
    Concurrency: 1,
    Rules: []types.Rule{
        {RuleID: "agency_file_exists", Severity: types.SEVERITY_ERROR},
        {RuleID: "agency_name_exists", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_exists"}},
    },
})
// A non-nil err indicates invalid inputs or an operational failure.
// A nonzero report.TotalErrors means the rules reported error findings.
```

A zero library concurrency uses 1. The CLI configures the shared telemetry logger
to write to stderr. The validator checks for cancellation before and after
import and passes the context to rule callbacks during execution.

`GtfsValidatorWithTrace` accepts the same options and also returns a
`*types.ValidationTrace` once the graph is valid.

## Rules and dependencies

Each rule has its own `src/rules/file-validations/<table>/<rule_id>.go` file
and is an exported method on that table's checks type. For example,
`file-validations/agency/agency_name_valid.go` defines this method.

```go
func (AgencyChecks) AgencyNameValid(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
    return fields.CheckOptions(ctx, db, config, agencyTable, nameColumn)
}
```

The validator finds methods by matching rule IDs to method names while ignoring
underscores and letter case, so `agency_name_valid` selects `AgencyNameValid`.
Adding a rule to an existing table package requires adding its file and rebuilding
with the normal build command. The lookup uses the compiled methods through
reflection during graph construction, and execution calls the resolved functions
directly. Each method must use a value receiver and the signature shown above.
Keep helper functions private to avoid exposing them as rule methods.

Each table declares its checks type in `checks.go`. When adding an entirely new
table package, import it and embed its checks type in `src/rules/checks.go`.
The rule-file test verifies that every rule file can be selected by its filename.
`file_validation` and `file_not_found_in_rules` are reserved notice IDs.

Every prerequisite must appear as a rule in the same array. Omit `depends_on`
for a rule without prerequisites. IDs and severities are normalized to
lowercase. A configured rule with no implementation produces a warning when
scheduled, regardless of its configured severity. Independent checks continue,
and checks depending on that rule are skipped. The validator rejects invalid
severities, duplicate rules or dependencies, missing prerequisites, and cycles
before importing the feed. `options` and `compare` are passed through to the rule
functions.

A finding at any reported severity fails the rule and skips dependent rules.
Independent branches continue. Ignored ordinary rules are skipped and block their
dependents. Ignored file-presence rules run so they can enforce prerequisites
without emitting a finding. Operational errors and panics abort the run and
cancel active checks. The executor waits for started checks to return.

## Generic DAG executor

The DAG executor lives in `src/services/dag.go`. `services.NewDAG` validates
IDs, functions, edges, and cycles before execution. `DAG.Execute(ctx, input, limit)`
passes the run input to each task and uses Kahn's algorithm with bounded
parallelism. Tasks return `types.Outcome[T]` and an error. A failed outcome blocks
descendants. An error aborts the run. Results are sorted by ID and retain each
task's value. Each execution owns its scheduling state.

Integration and CLI tests live in `tests/`.

```sh
go test -race ./...
go vet ./...
```
