# Import GTFS

TypeScript wrapper for the Go GTFS importer. Imports a local or remote ZIP into
SQLite and returns `_db`, `calendar_dates`, `routes`, `shapes`, `stop_times`,
`stops`, and `trips`, without GTFS validation.

```ts
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';

const gtfs = await importGtfsToDatabase({
    source: { path: './gtfs.zip' },
    sqlite_config: { instancePath: './gtfs.db' },
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
instances cannot be passed between processes. Memory databases are exported to a
temporary `.db` file. Relative paths use the caller's working directory.

The wrapper passes JSON directly to the CLI without a shell. Import errors reject
the promise with the CLI's stderr.

`_db` is a `SQLiteDatabase`. Each table handle is a `SQLiteTableInstance` with
`all`, `get`, `has`, `stream`, and the other SQLite client methods. Columns are
read from SQLite; empty fields are `null` and other values remain strings.
`calendar_dates` exposes raw table
rows, without expanding or filtering service dates. Missing or empty source
files produce `undefined` handles; header-only files produce empty tables.
Other imported GTFS tables remain accessible through `_db.databaseInstance`.

The caller owns the database connection and file. Call `_db.cleanup()` to close
and delete the file (including a custom output path), or call
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
