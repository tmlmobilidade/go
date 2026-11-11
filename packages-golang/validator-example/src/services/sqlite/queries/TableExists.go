package queries

import (
	"database/sql"
	"fmt"
)

/*
* TableExists checks the live schema for a table using a case-insensitive name
* comparison. Views and internal sqlite_* tables are excluded by the query.
* The name is a bound parameter; no table metadata is retained between calls.
* A nil database pool and schema query failures are returned as errors.
 */
func TableExists(db *sql.DB, name string) (bool, error) {
	//

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
