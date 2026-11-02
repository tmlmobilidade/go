package types

// SQLiteRow identifies a source row. Row is its zero-based data-row index.
type SQLiteRow struct {
	table   *SQLiteTable
	Row     int
	context *SQLiteContext
	name    string
	// Only the runner's current batch/group uses prefetched values. At/Context callers
	// continue to read SQLite directly; no values are cached on shared tables.
	values map[string]string
}
