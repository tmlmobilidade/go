package sqlite_types

// SQLiteRowGroup identifies a group of rows.
type SQLiteRowGroup struct {
	Rows    []int
	Grouped bool
}
