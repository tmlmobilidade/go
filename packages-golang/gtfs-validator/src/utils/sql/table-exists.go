package sql

import (
	"context"
	"database/sql"
	"fmt"
)

const tableExistsSQL = `EXISTS (
	SELECT 1 FROM main.sqlite_schema
	WHERE type = 'table' AND name = ? COLLATE NOCASE AND name NOT GLOB 'sqlite_*'
)`

// TableExists reports whether the main SQLite schema contains the named table.
func TableExists(ctx context.Context, db *sql.DB, table string) (bool, error) {
	if db == nil {
		return false, fmt.Errorf("check table %q: database is nil", table)
	}
	var exists bool
	if err := db.QueryRowContext(ctx, "SELECT "+tableExistsSQL, table).Scan(&exists); err != nil {
		return false, fmt.Errorf("check table %q: %w", table, err)
	}
	return exists, nil
}

func requireTable(ctx context.Context, db *sql.DB, table string) error {
	exists, err := TableExists(ctx, db, table)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("table %q does not exist", table)
	}
	return nil
}
