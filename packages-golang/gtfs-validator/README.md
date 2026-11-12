# GTFS validator

Imports a local GTFS ZIP or HTTP(S) URL through `import-gtfs` into an isolated,
temporary SQLite database, then executes the configured rules. The database and its
sidecar files are removed after success, validation failure, or operational failure.
Requires Go 1.26 and a C compiler for the SQLite driver.

**All registered checks currently return success as placeholders. An empty report
only confirms that the feed was imported and the configured graph ran.**

## CLI

```sh
go build -ldflags=-w -o dist/gtfs-validator ./src/cli.go
./dist/gtfs-validator -path ./gtfs.zip -rules ./rules.json -concurrency 1
./dist/gtfs-validator -url https://example.com/gtfs.zip -rules ./rules.json > report.json
```

Provide exactly one of `-path` or `-url`. The required `-rules` file holds a nonempty
JSON array. Each entry has a `rule_id` and `severity`. It can also supply
`depends_on` and `options` arrays of strings and a `compare` array of
`{"key":"…","value":"…"}` objects.

```json
[
  {"rule_id": "agency_file_missing", "severity": "error"},
  {"rule_id": "agency_name_field", "severity": "error", "depends_on": ["agency_file_missing"]},
  {"rule_id": "agency_name_valid", "severity": "warning", "depends_on": ["agency_name_field"], "options": ["Example"]}
]
```

`-concurrency` defaults to 1 and must be positive. SQLite uses one connection,
so concurrent rules still serialize database queries.

Stdout contains one JSON report for completed runs and operational failures.
Diagnostics go to stderr.

- `0` for a run with no error findings or for help.
- `1` for a run with error findings.
- `2` for invalid arguments or rules, import failure, or execution failure.

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
        {RuleID: "agency_file_missing", Severity: types.SEVERITY_ERROR},
        {RuleID: "agency_name_field", Severity: types.SEVERITY_ERROR, DependsOn: []string{"agency_file_missing"}},
    },
})
// A non-nil err indicates invalid inputs or an operational failure.
// A nonzero report.TotalErrors means the rules reported error findings.
```

A zero library concurrency uses 1. The CLI configures the shared telemetry logger
to write to stderr. The validator checks for cancellation before and after
import and passes the context to rule callbacks during execution.

## Rules and dependencies

The registry in `src/rules/registry.go` maps 367 executable IDs to functions.
Each rule has its own `src/rules/<rule_id>.go` file.
`file_validation` and `file_not_found_in_rules` are reserved notice IDs.

Every prerequisite must appear as a rule in the same array. Omit `depends_on`
for a rule without prerequisites. IDs and severities are normalized to
lowercase. The validator rejects unknown rules, invalid severities, duplicate
rules or dependencies, missing prerequisites, and cycles before importing the
feed. `options` and `compare` are passed through to the rule functions.

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
