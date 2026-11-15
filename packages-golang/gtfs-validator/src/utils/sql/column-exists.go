package sql

import (
	"context"
	"database/sql"
	"fmt"
)

// ColumnExists reports whether the named table contains a visible column.
func ColumnExists(ctx context.Context, db *sql.DB, table, column string) (bool, error) {
	tableExists, columnExists, err := columnPresence(ctx, db, table, column)
	return tableExists && columnExists, err
}

func columnPresence(ctx context.Context, db *sql.DB, table, column string) (bool, bool, error) {
	if db == nil {
		return false, false, fmt.Errorf("check column %q in %q: database is nil", column, table)
	}
	query := "SELECT " + tableExistsSQL + `, EXISTS (
		SELECT 1 FROM pragma_table_xinfo(?, 'main') WHERE name = ? COLLATE NOCASE AND hidden != 1
	)`
	var tableExists, columnExists bool
	if err := db.QueryRowContext(ctx, query, table, table, column).Scan(&tableExists, &columnExists); err != nil {
		return false, false, fmt.Errorf("check column %q in %q: %w", column, table, err)
	}
	return tableExists, columnExists, nil
}
