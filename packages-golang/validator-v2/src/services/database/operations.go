package database

import (
	"database/sql"
	"fmt"
)

// TODO: check if this function is needed
// GetTableCount returns the number of rows in a table
func GetTableCount(db *sql.DB, tableName string) (int, error) {
	//

	//
	// 1. Check if database connection is nil

	if db == nil {
		return 0, fmt.Errorf("database connection is nil")
	}

	//
	// 2. Get table count

	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", SanitizeName(tableName))
	var count int

	//
	// 3. Execute the query

	err := db.QueryRow(query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get table count for %s: %w", tableName, err)
	}

	//
	// 4. Return the count

	return count, nil
}
