package queries

import (
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

/*
* CountRows counts every row in the named table without loading its field values.
* The table and database connection are required. The table name is quoted as an
* identifier; absent tables and database failures are returned as query errors.
 */
func CountRows(table *types.SQLiteTable) (int, error) {
	//

	//
	// 1. Require a source table and an open database pool

	if table == nil || table.DB == nil {
		return 0, fmt.Errorf("counting rows requires a table and database connection")
	}

	//
	// 2. Ask SQLite for the count without materializing source rows

	var count int
	if err := table.DB.QueryRow("SELECT COUNT(*) FROM " + dbops.SanitizeName(table.Name)).Scan(&count); err != nil {
		return 0, err
	}

	//
	// 3. Return the total number of stored rows

	return count, nil
}
