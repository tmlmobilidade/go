package queries

import (
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	utils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/utils"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// Exists checks a value across the table without loading matching rows.
func Exists(t *types.SQLiteTable, field string, value string) (bool, error) {
	//

	//
	// 1. Build the query

	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeName(t.Name) +
		" AS source WHERE " + utils.Column(t, "source", field) + " = ?)"

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
