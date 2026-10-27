# Import GTFS

Imports a local or remote GTFS ZIP into SQLite, in memory or in a database file.

From this package directory, run the CLI:

```sh
go run ./src/cli.go -path /data/gtfs.zip -instance-path /data/gtfs.db
go run ./src/cli.go -url https://example.com/gtfs.zip
go run ./src/cli.go -config '{"source":{"path":"./gtfs.zip"},"sqlite_config":{"instancePath":"./gtfs.db"}}'
```

Flags: `-path` or `-url` (exactly one required), optional `-instance-name`,
`-instance-path`, and `-memory` (binary SQLite output instead of a path). Use `-h` or `--help` for help and examples:

```sh
go run ./src/cli.go --help
```

Alternatively, `-config` accepts a JSON object matching `ImportGtfsConfig`:
`source` contains `path` or `url`; optional `sqlite_config` supports
`instanceName`, `instancePath`, and `memory`. Database instances cannot be
supplied as JSON. Explicit CLI flags override JSON settings, including
`-memory=false`. A `-path` or `-url` flag replaces the entire JSON source.
Invalid JSON and unknown properties exit with code 2.

The CLI prints the database
path to stdout, or binary SQLite bytes when `memory` is true, and errors to stderr. Exit codes are 0 for success, 1 for import
failure, and 2 for invalid arguments.

Run `npm run build` to create `dist/import-gtfs`, or invoke the CLI from the
repository root with `npm run dev:go-import-gtfs -- -- -path /data/gtfs.zip`.

To call the importer from Go:

```go
import (
    sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
    importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
)

instancePath, err := importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
    Source: importgtfs.ImportGtfsConfigSource{Path: "/data/gtfs.zip"},
    Sqlite_config: sqlite.SQLiteDatabaseConfig{InstancePath: "/data/gtfs.db"},
})
```

Use `Source: importgtfs.ImportGtfsConfigSource{Url: "https://example.com/gtfs.zip"}`
for downloads. Provide exactly one source. `Sqlite_config` is optional.

For a live in-memory result, use `ImportGtfsToMemory` instead of the file-returning
API. Close it when finished:

```go
database, err := importgtfs.ImportGtfsToMemory(importgtfs.ImportGtfsConfig{
    Source: importgtfs.ImportGtfsConfigSource{Path: "/data/gtfs.zip"},
})
if err != nil {
    return err
}
defer database.Cleanup()
// Query database.DatabaseInstance or register tables on database.
```

This API ignores `InstancePath` and creates no database file. A supplied
`DatabaseInstance` must be in memory and stays open, including after errors.
The file-returning `ImportGtfsToDatabase` retains its export behavior for compatibility.

Optional `time_range` selects active service dates and filters the imported feed:

```json
{
    "source": { "path": "./gtfs.zip" },
    "time_range": {
        "date_range": { "start": 20261001, "end": 20261031 },
        "discrete_dates": [20261027]
    }
}
```

In Go, set `Time_range` to `&importgtfs.ImportGtfsConfigTimeRange{}` with
`Date_range: &importgtfs.ImportGtfsConfigDateRange{Start: 20261001, End: 20261031}`
and/or `Discrete_dates: []int{20261027}`. Dates are YYYYMMDD integers. The range
includes both endpoints; when both filters are supplied, dates must match both.
An omitted filter, empty object, or empty discrete list imports all dates.
Invalid configuration dates and reversed ranges fail before importing.

With a nonempty filter, weekly `calendar.txt` schedules expand to individual
service dates. `calendar_dates.txt` additions and removals are applied afterwards.
The resulting `calendar_dates` contains only active dates (`exception_type = 1`);
`calendar` is left empty to avoid reintroducing unselected service dates. Custom
exception columns are preserved; generated weekly dates have NULL custom fields.
Calendar files must contain the columns needed to resolve their service dates.

Trips without selected active dates are removed, followed by their stop times,
routes, shapes, and stops. Referenced parent stations are retained recursively.
Missing optional files are supported. Other GTFS tables retain their raw rows.
Filtering is staged inside the import transaction and affects only incoming data;
existing database rows are retained. Omit `time_range` (or pass an empty filter)
to retain the raw import behavior, including unmodified calendars and exceptions.

Recognized GTFS `.txt` files become tables named after the file, including files
inside archive directories. Headers define the columns; all values are stored as
`TEXT`, preserving leading zeros and custom columns. Empty CSV fields (including
quoted empty strings) become SQL `NULL`; whitespace and other text are preserved. UTF-8 BOMs,
quoted fields, and multiline CSV values are supported. Empty files are skipped;
header-only files create empty tables. Other files are ignored.

Raw imports do not check required GTFS files, fields, values, or relationships.
Date filtering checks the calendar and reference columns it needs.
Unreadable ZIPs, malformed CSV, and SQL errors return an error. Table creation and
row inserts run in one transaction, so a failed import rolls them back. Existing
tables receive additional rows and must be compatible with the CSV headers.

Databases created by the importer are closed before returning. Supplied database
instances stay open and use their actual database path. Memory databases are
exported to a temporary `.db` file, even when an `InstancePath` was configured.
Without a custom disk path, output is placed in a temporary directory; callers
own the returned file and its cleanup. Failed imports remove importer-created
temporary output. Local source archives and caller-owned databases are retained.

Run `go test ./...`, `go vet ./...`, or `npm run build` from this directory.
The build and dev scripts use `-ldflags=-w` to skip DWARF debug information,
avoiding macOS linker padding failures when combining debug information.
For direct CLI commands on affected toolchains, use
`go run -ldflags=-w ./src/cli.go` followed by the import arguments.
