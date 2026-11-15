package sql

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

// ForEachRow visits rows in ascending SQLite rowid order. Positions are zero
// based (rowid - 1). Each visit gets a fresh map keyed by the requested column
// names, with empty strings for missing columns and NULL cells. An empty
// column list visits positions alone. The cursor closes before each batch's
// callbacks, so visit can query db even with a single connection.
func ForEachRow(ctx context.Context, db *sql.DB, table string, columns []string, visit func(row int, values map[string]string) error) error {
	if visit == nil {
		return fmt.Errorf("visit rows in %q: callback is nil", table)
	}
	if err := requireTable(ctx, db, table); err != nil {
		return err
	}
	available, err := tableColumns(ctx, db, table)
	if err != nil {
		return err
	}

	// CSV headers can shadow SQLite's names for the hidden rowid.
	var rowID string
	for _, alias := range []string{"rowid", "_rowid_", "oid"} {
		if _, shadowed := available[alias]; !shadowed {
			rowID = "source." + alias
			break
		}
	}
	if rowID == "" {
		return fmt.Errorf("visit rows in %q: all SQLite rowid aliases are shadowed", table)
	}

	projection := []string{rowID}
	for _, column := range columns {
		expression := "NULL"
		if visible, exists := available[sqliteLower(column)]; exists && visible {
			expression = "source." + quoteIdentifier(column)
		}
		projection = append(projection, expression)
	}
	selectRows := "SELECT " + strings.Join(projection, ", ") + " FROM main." + quoteIdentifier(table) + " AS source"
	order := " ORDER BY " + rowID + " LIMIT ?"
	query := selectRows + order
	args := []any{rowBatchSize}

	for {
		batch, err := readRowBatch(ctx, db, query, args, columns)
		if err != nil {
			return fmt.Errorf("read rows in %q: %w", table, err)
		}
		for _, row := range batch {
			if err := ctx.Err(); err != nil {
				return err
			}
			if err := visit(row.position, row.values); err != nil {
				return err
			}
		}
		if len(batch) < rowBatchSize {
			return ctx.Err()
		}
		lastRow := batch[len(batch)-1]
		query = selectRows + " WHERE " + rowID + " > ?" + order
		args = []any{lastRow.position + 1, rowBatchSize}
	}
}
