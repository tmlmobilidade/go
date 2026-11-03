package queries

import (
	"database/sql"
	"fmt"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// Fields requests only the named fields in one query. Missing columns and SQL
// NULL values are represented by empty strings, just like empty CSV cells.
func Fields(r *types.SQLiteRow, fields ...string) (map[string]string, error) {
	//

	//
	// 1. Check if the row is nil

	if r == nil || r.Table == nil {
		return nil, fmt.Errorf("select a row from a table before reading fields")
	}

	//
	// 2. Check if the fields are empty

	if len(fields) == 0 {
		return nil, fmt.Errorf("at least one field is required")
	}

	//
	// 3. Check if the values are already cached

	if r.Values != nil {
		result := make(map[string]string, len(fields))
		for _, field := range fields {
			result[field] = r.Values[field]
		}
		return result, nil
	}

	//
	// 4. Check if the database connection is nil

	if r.Table.DB == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	//
	// 5. Build the query

	columns := make([]string, len(fields))
	values := make([]sql.NullString, len(fields))
	targets := make([]any, len(fields))
	for i, field := range fields {
		columns[i] = utils.Column(r.Table, "source", field)
		targets[i] = &values[i]
	}
	query := "SELECT " + strings.Join(columns, ", ") + " FROM " + dbops.SanitizeName(r.Table.Name) + " AS source WHERE source.rowid = ?"
	if err := r.Table.DB.QueryRow(query, r.Row+1).Scan(targets...); err != nil {
		return nil, fmt.Errorf("read %s row %d: %w", r.Table.Name, r.Row, err)
	}

	//
	// 6. Return the result

	result := make(map[string]string, len(fields))
	for i, field := range fields {
		result[field] = values[i].String
	}
	return result, nil
}
