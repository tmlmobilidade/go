package queries

import (
	"fmt"
	"slices"
	"strings"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// ExistsMatching checks whether one row matches every supplied field value.
// Values are bound parameters, including quotes and SQL-looking identifiers.
func ExistsMatching(table *types.SQLiteTable, fields map[string]string) (bool, error) {
	if table == nil || table.DB == nil || len(fields) == 0 {
		return false, fmt.Errorf("matching rows requires a table, database, and fields")
	}
	keys := make([]string, 0, len(fields))
	for key := range fields {
		keys = append(keys, key)
	}
	slices.Sort(keys)
	conditions := make([]string, 0, len(keys))
	values := make([]any, 0, len(keys))
	for _, key := range keys {
		expression, err := column(table, "source", key)
		if err != nil {
			return false, err
		}
		conditions = append(conditions, "COALESCE("+expression+", '') = ?")
		values = append(values, fields[key])
	}
	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeName(table.Name) +
		" AS source WHERE " + strings.Join(conditions, " AND ") + ")"
	var exists bool
	if err := table.DB.QueryRow(query, values...).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}
