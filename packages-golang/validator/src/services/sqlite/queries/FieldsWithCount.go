package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// FieldWithCount reads a field and counts equal values in this table in one query.
func FieldWithCount(r *types.SQLiteRow, field string) (string, int, error) {
	//

	//
	// 1. Check if the row is nil

	if r == nil || r.Table == nil {
		return "", 0, fmt.Errorf("select a row from a table before reading fields")
	}

	//
	// 2. Build the query

	table := dbops.SanitizeName(r.Table.Name)
	expression, err := column(r.Table, "source", field)
	if err != nil {
		return "", 0, err
	}
	other := "NULL"
	if expression != "NULL" {
		other = "other." + dbops.SanitizeName(field)
	}
	query := "SELECT " + expression + ", (SELECT COUNT(*) FROM " + table + " AS other WHERE " + other + " = " + expression + ") FROM " + table + " AS source WHERE source.rowid = ?"

	//
	// 3. Execute the query

	var value sql.NullString
	var count int
	if err := r.Table.DB.QueryRow(query, r.Row+1).Scan(&value, &count); err != nil {
		return "", 0, fmt.Errorf("read %s.%s row %d: %w", r.Table.Name, field, r.Row, err)
	}

	//
	// 4. Return the value and count

	return value.String, count, nil
}
