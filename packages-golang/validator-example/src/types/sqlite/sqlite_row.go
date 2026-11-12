package sqlite_types

// SQLiteRow identifies a source row. Row is its zero-based data-row index.
type SQLiteRow struct {
	Table *SQLiteTable
	Row   int
	Name  string
	// Only the current batch uses prefetched values. Other row callers
	// continue to read SQLite directly; no values are cached on shared tables.
	Values map[string]string
}
