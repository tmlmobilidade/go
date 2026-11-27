package sql

import (
	"context"
	"database/sql"
	"fmt"
)

// CountRows returns the number of rows in the named table.
func CountRows(ctx context.Context, db *sql.DB, table string) (int, error) {
	if err := requireTable(ctx, db, table); err != nil {
		return 0, err
	}
	var count int
	query := "SELECT COUNT(*) FROM main." + quoteIdentifier(table)
	if err := db.QueryRowContext(ctx, query).Scan(&count); err != nil {
		return 0, fmt.Errorf("count rows in %q: %w", table, err)
	}
	return count, nil
}
