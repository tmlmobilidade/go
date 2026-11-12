package queries

import (
	"database/sql"
	"fmt"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
)

/*
* Fields reads named values from a source row. If Values contains every requested
* field, the result is copied from that row's prefetched data without querying.
* Otherwise, all requested fields are selected in one query using Row + 1 as rowid.
* Missing columns and SQL NULL cells become empty strings. Partial prefetched
* values are not merged with database values, and no shared cache is updated.
* A missing source row or database failure is returned as an error.
 */
func Fields(r *types.SQLiteRow, fields ...string) (map[string]string, error) {
	//

	//
	// 1. Require a row reference and its source table

	if r == nil || r.Table == nil {
		return nil, fmt.Errorf("select a row from a table before reading fields")
	}

	//
	// 2. Require at least one requested field

	if len(fields) == 0 {
		return nil, fmt.Errorf("at least one field is required")
	}

	//
	// 3. Reuse prefetched values only when every requested field is present

	if r.Values != nil {
		result := make(map[string]string, len(fields))
		allCached := true
		for _, field := range fields {
			value, cached := r.Values[field]
			if !cached {
				allCached = false
				break
			}
			result[field] = value
		}
		if allCached {
			return result, nil
		}
	}

	//
	// 4. Require a database pool when the prefetched row cannot satisfy the request

	if r.Table.DB == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	//
	// 5. Resolve the requested columns and read them by the original source rowid

	columns := make([]string, len(fields))
	values := make([]sql.NullString, len(fields))
	targets := make([]any, len(fields))
	for i, field := range fields {
		expression, err := column(r.Table, "source", field)
		if err != nil {
			return nil, err
		}
		columns[i] = expression
		targets[i] = &values[i]
	}
	query := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeName(r.Table.Name) + " AS source WHERE source.rowid = ?"
	if err := r.Table.DB.QueryRow(query, r.Row+1).Scan(targets...); err != nil {
		return nil, fmt.Errorf("read %s row %d: %w", r.Table.Name, r.Row, err)
	}

	//
	// 6. Convert nullable SQLite values to the empty-string CSV representation

	result := make(map[string]string, len(fields))
	for i, field := range fields {
		result[field] = values[i].String
	}
	return result, nil
}
