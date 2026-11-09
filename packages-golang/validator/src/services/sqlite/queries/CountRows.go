package queries

import (
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// CountRows counts source records without loading GTFS data into memory.
func CountRows(table *types.SQLiteTable) (int, error) {
	if table == nil || table.DB == nil {
		return 0, fmt.Errorf("counting rows requires a table and database connection")
	}
	var count int
	if err := table.DB.QueryRow("SELECT COUNT(*) FROM " + dbops.SanitizeName(table.Name)).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
