package sql

import (
	"context"
	"database/sql"
	"fmt"
)

// Exists reports whether any row has a column equal to value. A missing column
// and SQL NULL never match. A missing table returns an error.
func Exists(ctx context.Context, db *sql.DB, table, column, value string) (bool, error) {
	tableExists, columnExists, err := columnPresence(ctx, db, table, column)
	if err != nil {
		return false, err
	}
	if !tableExists {
		return false, fmt.Errorf("table %q does not exist", table)
	}
	if !columnExists {
		return false, nil
	}

	var exists bool
	query := "SELECT EXISTS (SELECT 1 FROM main." + quoteIdentifier(table) +
		" AS source WHERE source." + quoteIdentifier(column) + " = ?)"
	if err := db.QueryRowContext(ctx, query, value).Scan(&exists); err != nil {
		return false, fmt.Errorf("match column %q in %q: %w", column, table, err)
	}
	return exists, nil
}
