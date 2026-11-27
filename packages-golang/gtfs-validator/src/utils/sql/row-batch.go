package sql

import (
	"context"
	"database/sql"
)

const rowBatchSize = 512

type sourceRow struct {
	position int
	values   map[string]string
}

func readRowBatch(ctx context.Context, db *sql.DB, query string, args []any, columns []string) ([]sourceRow, error) {
	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rowID int
	cells := make([]sql.NullString, len(columns))
	destinations := []any{&rowID}
	for i := range cells {
		destinations = append(destinations, &cells[i])
	}

	batch := make([]sourceRow, 0, rowBatchSize)
	for rows.Next() {
		if err := rows.Scan(destinations...); err != nil {
			return nil, err
		}
		values := make(map[string]string, len(columns))
		for i, column := range columns {
			values[column] = cells[i].String
		}
		batch = append(batch, sourceRow{position: rowID - 1, values: values})
	}
	return batch, rows.Err()
}
