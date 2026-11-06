package context_types

// RowError retains the source location of an operational validation failure.
type RowError struct {
	Table string
	Field string
	Row   int
	Err   error
}
