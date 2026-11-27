package sql

import (
	"context"
	"database/sql"
	"fmt"
)

// ColumnTextSet returns the non-NULL values in a column as a set of strings.
// A missing table or column yields an empty set.
func ColumnTextSet(ctx context.Context, db *sql.DB, table, column string) (map[string]struct{}, error) {
	exists, err := ColumnExists(ctx, db, table, column)
	if err != nil || !exists {
		return nil, err
	}

	key := "source." + quoteIdentifier(column)
	// A shape or service ID can occur on many rows. Deduplicate exact IDs in SQLite.
	query := "SELECT DISTINCT " + key + " COLLATE BINARY FROM main." + quoteIdentifier(table) + " AS source WHERE " + key + " IS NOT NULL"
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("read values of %q in %q: %w", column, table, err)
	}
	defer rows.Close()

	values := make(map[string]struct{})
	var value string
	for rows.Next() {
		if err := rows.Scan(&value); err != nil {
			return nil, fmt.Errorf("read values of %q in %q: %w", column, table, err)
		}
		values[value] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("read values of %q in %q: %w", column, table, err)
	}
	return values, nil
}
