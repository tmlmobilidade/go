package types

import (
	"database/sql"
)

// SQLiteTable shares a database connection and column names, never row values.
type SQLiteTable struct {
	DB       *sql.DB
	Name     string
	Columns  map[string]bool
	Prepared *SQLiteTables
}
