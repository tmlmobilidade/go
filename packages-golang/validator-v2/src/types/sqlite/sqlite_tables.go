package sqlite_types

import (
	"database/sql"
)

// SQLiteTables is an immutable collection prepared before concurrent validations.
// It shares table metadata and the connection pool, never row values.
type SQLiteTables struct {
	DB     *sql.DB
	Tables map[string]*SQLiteTable
}
