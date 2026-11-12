package queries

import (
	"fmt"

	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* columnExists checks one field against the current SQLite schema using either
* a connection pool or an active transaction. Generated columns are included;
* hidden virtual-table columns are excluded, matching SELECT * visibility.
* The result is never cached. Query failures include the table and field names.
 */
func columnExists(db types.RowQuerier, table, field string) (bool, error) {
	//

	//
	// 1. Query visible columns, passing table and field names as bound values

	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM pragma_table_xinfo(?) WHERE name = ? AND hidden != 1)", table, field).Scan(&exists)

	//
	// 2. Preserve the query error with the column's source table and name

	if err != nil {
		return false, fmt.Errorf("check SQLite column %s.%s: %w", table, field, err)
	}

	//
	// 3. Return whether the field is available to data queries

	return exists, nil
}
