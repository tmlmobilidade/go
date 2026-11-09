# GTFS validator

Imports a local GTFS ZIP or HTTP(S) URL through `import-gtfs` into an isolated,
temporary SQLite database, then executes the built-in rules. The database and its
sidecar files are removed after success, validation failure, or operational failure.
Requires Go 1.26 and a C compiler for the SQLite driver.

## CLI

From this directory:

```sh
go build -o dist/gtfs-validator ./src/cli.go
./dist/gtfs-validator -path ./gtfs.zip -config '{}' -concurrency 1
./dist/gtfs-validator -url https://example.com/gtfs.zip > report.json
```

Provide exactly one of `-path` or `-url`. `-config` accepts an inline JSON object;
its contents are reserved for future settings and currently have no effect.
`-concurrency` defaults to 1 and must be positive. SQLite uses one connection,
so concurrent rules still serialize database queries.

Stdout contains one JSON report; diagnostics go to stderr. Exit codes:

- `0`: no error findings (warnings allowed), or help.
- `1`: validation completed with error findings.
- `2`: invalid arguments/config, import failure, or execution failure.

Reports contain every rule in ID order, findings, error/warning totals, and skip
reasons. `blocked_by` lists direct prerequisites that did not pass. On operational
failure, the report also contains an `error`; independent unstarted rules are
skipped with an abort reason. CLI argument failures do not produce a report.
Finding totals count findings, not affected rows.

## Go library

```go
import (
    "context"

    validator "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src"
    importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

report, err := validator.GtfsValidator(context.Background(), validator.Options{
    Source: importgtfs.ImportGtfsConfigSource{Path: "./gtfs.zip"},
    Concurrency: 1,
})
// err != nil: operational failure; report may contain partial results.
// report.TotalErrors > 0: invalid feed, independently of err.
```

A zero library concurrency uses 1. The library uses the shared telemetry logger;
the CLI configures it to write to stderr. Importer APIs do not accept a context:
cancellation is checked before/after import, then supported during rule execution.

## Rules and dependencies

The internal registry in `src/rules/registry.go` maps fixed IDs to functions and hardcoded
prerequisites. Each rule function lives in its own file under `src/rules/`.
There is no external registration API. Initial checks form a chain:

```text
agency_file_present → agency_name_field_present → agency_name_valid
```

Rules return findings separately from operational errors. Error findings mark a
rule `failed`; descendants become `skipped`, while independent branches continue.
Warnings allow dependents to proceed. Operational errors or panics mark a rule
`errored`, cancel running work, and abort scheduling. Cancellation is cooperative;
the executor waits for all started functions to return. Successful rules are `passed`.

The name check reports one finding with the number of empty/ASCII-whitespace-only
names. Original CSV line numbers are not preserved, so row references are omitted.
These three checks are examples, not a complete GTFS conformance validator.
TypeScript validator integration and config-driven rule selection are deferred.

## Generic DAG executor

The public `dag` subpackage has no GTFS or database dependencies. `dag.New` validates
IDs, functions, edges, and cycles before execution. `DAG.Execute(ctx, limit)` uses
Kahn's algorithm with bounded parallelism. Tasks return `dag.Outcome[T]` plus an
error: `Failed: true` blocks descendants, while an error aborts the run. Results
retain each task's value and are sorted by ID. Graph bookkeeping is fresh per run;
functions and any shared state must be safe for the requested concurrency/reuse.

All tests live in `tests/` and exercise the public package APIs and CLI.

```sh
go test -race ./...
go vet ./...
```
