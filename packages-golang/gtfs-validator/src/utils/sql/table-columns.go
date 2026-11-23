package sql

import (
	"context"
	"database/sql"
	"fmt"
)

// tableColumns records all column names and whether each is visible to callers.
func tableColumns(ctx context.Context, db *sql.DB, table string) (map[string]bool, error) {
	rows, err := db.QueryContext(ctx, `SELECT name, hidden FROM pragma_table_xinfo(?, 'main')`, table)
	if err != nil {
		return nil, fmt.Errorf("read columns in %q: %w", table, err)
	}
	defer rows.Close()

	columns := make(map[string]bool)
	for rows.Next() {
		var name string
		var hidden int
		if err := rows.Scan(&name, &hidden); err != nil {
			return nil, fmt.Errorf("read columns in %q: %w", table, err)
		}
		columns[sqliteLower(name)] = hidden != 1
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read columns in %q: %w", table, err)
	}
	return columns, nil
}

// SQLite folds ASCII letters only when comparing identifiers.
func sqliteLower(name string) string {
	lower := []byte(name)
	for i, letter := range lower {
		if letter >= 'A' && letter <= 'Z' {
			lower[i] += 'a' - 'A'
		}
	}
	return string(lower)
}
