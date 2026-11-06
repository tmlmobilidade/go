package logger_types

// TableCounter supplies a row count without coupling progress tracking to storage.
type TableCounter interface {
	GetTableCount(string) (int, error)
}
