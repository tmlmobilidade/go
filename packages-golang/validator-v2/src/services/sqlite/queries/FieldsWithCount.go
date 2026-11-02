package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
)

// FieldWithCount reads a field and counts equal values in this table in one query.
func FieldWithCount(r *types.SQLiteRow, field string) (string, int, error) {
	if r.Table == nil {
		return "", 0, fmt.Errorf("select a row from %s before reading fields", r.Name)
	}
	table := dbops.SanitizeName(r.Table.Name)
	column := utils.Column(r.Table, "source", field)
	query := "SELECT " + column + ", (SELECT COUNT(*) FROM " + table + " AS other WHERE " + utils.Column(r.Table, "other", field) + " = " + column + ") FROM " + table + " AS source WHERE source.rowid = ?"
	var value sql.NullString
	var count int
	if err := r.Table.DB.QueryRow(query, r.Row+1).Scan(&value, &count); err != nil {
		return "", 0, fmt.Errorf("read %s.%s row %d: %w", r.Table.Name, field, r.Row, err)
	}
	return value.String, count, nil
}