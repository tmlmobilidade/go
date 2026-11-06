package queries

import (
	"database/sql"
	"fmt"
)

// TableExists checks the current database schema for an imported table.
func TableExists(db *sql.DB, name string) (bool, error) {
	//
	// 1. Require a database connection

	if db == nil {
		return false, fmt.Errorf("database connection is nil")
	}

	//
	// 2. Check table existence without retaining schema metadata

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = ? COLLATE NOCASE AND name NOT GLOB 'sqlite_*')", name).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check SQLite table %q: %w", name, err)
	}
	return exists, nil
}
