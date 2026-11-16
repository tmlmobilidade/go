# Import GTFS

TypeScript wrapper for the Go GTFS importer. Imports a local or remote ZIP into
SQLite and returns `_db`, `calendar_dates`, `routes`, `shapes`, `stop_times`,
`stops`, and `trips`, without GTFS validation.

```ts
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';

const gtfs = await importGtfsToDatabase({
    source: { path: './gtfs.zip' },
    sqlite_config: { memory: true },
});

try {
    console.log(gtfs.stops?.all());
    console.log(gtfs.trips?.get('trip_id', '001'));
} finally {
    gtfs._db.cleanup();
}
```

Use `source: { url: 'https://example.com/gtfs.zip' }` for downloads. Optional
`sqlite_config` accepts `instanceName`, `instancePath`, and `memory`. Live database
instances cannot be passed between processes. Set `sqlite_config: { memory: true }`
to receive an in-memory database; `instancePath` is ignored and no database file
is created. Go transfers a binary SQLite image over stdout, which TypeScript
opens in memory. Memory addresses cannot be shared between these processes.
The transfer temporarily holds database copies in memory. Relative paths use
the caller's working directory.

The wrapper passes JSON directly to the CLI without a shell. Import errors reject
the promise with the CLI's stderr. Telemetry is forwarded to the parent's stderr
as it arrives, in both file and memory modes. `ENVIRONMENT=dev` selects readable
logs; other values produce OpenTelemetry JSON.

`_db` is a `SQLiteDatabase`. Each table handle is a `SQLiteTableInstance` with
`all`, `get`, `has`, `stream`, and the other SQLite client methods. Columns are
read from SQLite; empty fields are `null` and other values remain strings.
`calendar_dates` is a `Record<string, OperationalDateInt[]>` keyed by service ID,
containing distinct numeric dates with `exception_type: '1'`. It is empty when
no calendar-date rows exist. With a nonempty filter, these are resolved active
service dates after expanding weekly calendars and applying exceptions. Without
that filter, only explicit additions from `calendar_dates.txt` are included;
weekly calendars are not expanded. Raw calendar rows remain available through
`_db.databaseInstance`. Missing or empty source files produce `undefined` table
handles; header-only files produce empty tables.
Other imported GTFS tables remain accessible through `_db.databaseInstance`.

Pass a complete table bundle type to preserve each table's row type:

```ts
const gtfs = await importGtfsToDatabase<GtfsHubV1SQLTables>(config);
```

The generic describes the returned bundle without validating or converting row
values. Missing tables still return `undefined`, so custom bundles must reflect
the tables guaranteed by the source archive.

Optional `time_range` accepts the same dates as the legacy importer:

```ts
time_range: {
    date_range: {
        start: OperationalDateIntSchema.parse(20261001),
        end: OperationalDateIntSchema.parse(20261031),
    },
    discrete_dates: [OperationalDateIntSchema.parse(20261027)],
},
```

Import `OperationalDateIntSchema` from `@tmlmobilidade/go-types-shared`.
The range includes both endpoints. When both filters are supplied, dates must
match both. An omitted filter, `{}`, or an empty `discrete_dates` array imports
all dates. Invalid configuration dates or reversed ranges reject the import.
A nonempty filter expands `calendar.txt` weekdays, applies `calendar_dates.txt`
additions/removals, and keeps trips with selected active dates. It then keeps only
referenced stop times, routes, shapes, and stops (including parent stations).
The resolved `calendar_dates` rows have `exception_type: '1'`; the imported
`calendar` table is empty. Custom exception fields are preserved; generated weekly
dates have `null` custom fields. Other GTFS tables and existing database rows are
retained. An omitted or empty filter preserves raw import behavior.

The caller owns the database connection and any output file. Call `_db.cleanup()` to close
and release its memory or delete its file (including a custom output path), or call
`_db.databaseInstance.close()` to close the connection and retain the file.

From the repository root, build with:

```sh
npx turbo run build --filter=@tmlmobilidade/go-utils-import-gtfs
npm run test --workspace=@tmlmobilidade/go-utils-import-gtfs
```

The build includes the Go CLI in `dist/bin/import-gtfs`; Go and a C compiler are
required at build time. Go is not required at runtime. The resulting package must
run on the same OS and architecture as the build machine. The Go workspace is
named `@tmlmobilidade/go-golang-import-gtfs`.
