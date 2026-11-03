package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// FieldWithCount reads a field and counts equal values in this table in one query.
func FieldWithCount(r *types.SQLiteRow, field string) (string, int, error) {
	//

	//
	// 1. Check if the row is nil

	if r.Table == nil {
		return "", 0, fmt.Errorf("select a row from %s before reading fields", r.Name)
	}

	//
	// 2. Build the query

	table := dbops.SanitizeName(r.Table.Name)
	column := utils.Column(r.Table, "source", field)
	query := "SELECT " + column + ", (SELECT COUNT(*) FROM " + table + " AS other WHERE " + utils.Column(r.Table, "other", field) + " = " + column + ") FROM " + table + " AS source WHERE source.rowid = ?"

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
