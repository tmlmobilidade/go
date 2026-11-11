package sqlite_types

import "database/sql"

// RowQuerier lets schema checks use either a connection pool (*sql.DB) or an
// active transaction (*sql.Tx) without managing that connection's lifetime.
type RowQuerier interface {
	QueryRow(string, ...any) *sql.Row
}
