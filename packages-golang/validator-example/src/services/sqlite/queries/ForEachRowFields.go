package queries

import (
	"database/sql"
	"fmt"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/sqlite"
)

/*
* ForEachRowFields reads source rows and requested fields in batches of at most
* 512 rows. A table, database pool, non-empty field list and callback are required.
* Each batch follows ascending rowid order and resumes strictly after the last
* rowid read. Source positions remain rowid - 1, including gaps between rowids.
* Missing columns and SQL NULL cells become empty strings in each row's Values
* map, allowing Fields to reuse that row's data without another query.
* Every cursor closes before callbacks run, permitting nested queries with one
* connection. Query, scan, cursor, close and callback failures stop processing.
 */
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

		// Continue after the last source rowid instead of using an OFFSET. The
		// initial batch has no lower bound, so it does not skip any stored rowid.
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
			// Each row owns its map; later scans can safely reuse the scan buffers.
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
		// A short batch proves the cursor reached the end. A full batch requires
		// another query, even when the table size is an exact multiple of 512.
		if len(batch) < batchSize {
			return nil
		}
		firstBatch = false
	}
}
