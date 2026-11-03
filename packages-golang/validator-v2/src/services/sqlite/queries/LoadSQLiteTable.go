package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// LoadSQLiteTable loads metadata for an existing SQLite table without fetching row values.
func LoadSQLiteTable(db *sql.DB, name string) (*types.SQLiteTable, error) {
	//

	//
	// 1. Check if the database connection is nil

	if db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	//
	// 2. Query the table

	rows, err := db.Query("SELECT * FROM " + dbops.SanitizeName(name) + " LIMIT 0")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	//
	// 3. Get the columns

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	//
	// 4. Create table struct in memory

	table := &types.SQLiteTable{DB: db, Name: name, Columns: make(map[string]bool, len(columns))}
	for _, column := range columns {
		table.Columns[column] = true
	}

	//
	// 5. Return the table

	return table, nil
}
