package queries

import (
	"database/sql"
	"fmt"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/database"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
)

// ForEachRowFields reads bounded batches of source rows and their requested fields.
// Each cursor closes before checks run, allowing nested queries even with a single
// database connection. Missing columns and NULL cells become empty strings.
func ForEachRowFields(table *types.SQLiteTable, fields []string, fn func(*types.SQLiteRow) error) error {
	//

	//
	// 1. Require a table, its connection, fields, and a callback

	if table == nil || table.DB == nil {
		return fmt.Errorf("SQLite table and database connection are required")
	}
	if len(fields) == 0 {
		return fmt.Errorf("at least one field is required")
	}
	if fn == nil {
		return fmt.Errorf("row callback is required")
	}

	//
	// 2. Select only the requested columns and retain the source row identifier

	const batchSize = 512
	columns := []string{"source.rowid"}
	for _, field := range fields {
		expression, err := column(table, "source", field)
		if err != nil {
			return err
		}
		columns = append(columns, expression)
	}
	selectRows := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeName(table.Name) + " AS source"
	firstBatch := true
	var lastRowID int
	for {
		query := selectRows
		var args []any
		if !firstBatch {
			query += " WHERE source.rowid > ?"
			args = append(args, lastRowID)
		}
		query += " ORDER BY source.rowid LIMIT ?"
		args = append(args, batchSize)
		rows, err := table.DB.Query(query, args...)
		if err != nil {
			return fmt.Errorf("read %s validation rows: %w", table.Name, err)
		}

		//
		// 3. Buffer one batch, normalizing imported NULL cells without changing SQLite

		batch := make([]*types.SQLiteRow, 0, batchSize)
		values := make([]sql.NullString, len(fields))
		targets := make([]any, len(fields)+1)
		var rowID int
		targets[0] = &rowID
		for i := range fields {
			targets[i+1] = &values[i]
		}
		for rows.Next() {
			if err := rows.Scan(targets...); err != nil {
				rows.Close()
				return fmt.Errorf("read %s validation row: %w", table.Name, err)
			}
			row := utils.At(table, rowID-1)
			row.Values = make(map[string]string, len(fields))
			for i, field := range fields {
				row.Values[field] = values[i].String
			}
			batch = append(batch, row)
			lastRowID = rowID
		}
		readErr := rows.Err()
		closeErr := rows.Close()
		if readErr != nil {
			return fmt.Errorf("read %s validation rows: %w", table.Name, readErr)
		}
		if closeErr != nil {
			return fmt.Errorf("close %s validation rows: %w", table.Name, closeErr)
		}

		//
		// 4. Run callbacks after releasing the cursor's database connection

		for _, row := range batch {
			if err := fn(row); err != nil {
				return err
			}
		}
		if len(batch) < batchSize {
			return nil
		}
		firstBatch = false
	}
}
