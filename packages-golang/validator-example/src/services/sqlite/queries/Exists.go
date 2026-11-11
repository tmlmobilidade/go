package queries

import (
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/sqlite"
)

/*
* Exists checks whether any source row has a field exactly equal to value.
* The value is bound separately from SQL, and matching rows are not loaded.
* SQL NULL and missing columns do not match an empty string.
* Invalid table references, schema failures and query failures return errors.
 */
func Exists(t *types.SQLiteTable, field string, value string) (bool, error) {
	//

	//
	// 1. Resolve the field against the live schema and build an equality lookup

	expression, err := column(t, "source", field)
	if err != nil {
		return false, err
	}
	query := "SELECT EXISTS(SELECT 1 FROM " + dbops.SanitizeName(t.Name) +
		" AS source WHERE " + expression + " = ?)"

	//
	// 2. Bind the value and read whether at least one matching row exists

	var exists bool
	if err := t.DB.QueryRow(query, value).Scan(&exists); err != nil {
		return false, fmt.Errorf("check %s.%s: %w", t.Name, field, err)
	}

	//
	// 3. Return the result

	return exists, nil
}
