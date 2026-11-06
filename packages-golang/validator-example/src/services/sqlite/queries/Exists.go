package queries

import (
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
)

// Exists checks a value across the table without loading matching rows.
func Exists(t *types.SQLiteTable, field string, value string) (bool, error) {
	//

	//
	// 1. Build the query

	expression, err := column(t, "source", field)
	if err != nil {
		return false, err
	}
	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeName(t.Name) +
		" AS source WHERE " + expression + " = ?)"

	//
	// 2. Execute the query

	var exists bool
	if err := t.DB.QueryRow(query, value).Scan(&exists); err != nil {
		return false, fmt.Errorf("check %s.%s: %w", t.Name, field, err)
	}

	//
	// 3. Return the result

	return exists, nil
}
