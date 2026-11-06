package sqlite_types

import (
	"database/sql"
)

// SQLiteTable identifies a table through its database connection and name.
// Table and column existence are queried directly from SQLite.
type SQLiteTable struct {
	DB   *sql.DB
	Name string
}
