package queries

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"
)

// LoadSQLiteTables discovers imported tables and shares their metadata between checks.
// It reads column names only; GTFS rows remain in SQLite and no indexes are created.
func LoadSQLiteTables(db *sql.DB) (*types.SQLiteTables, error) {
	//

	//
	// 1. Require an open database connection

	if db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}

	//
	// 2. List user tables, preserving their names and excluding SQLite internals

	rows, err := db.Query("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT GLOB 'sqlite_*' ORDER BY name")
	if err != nil {
		return nil, fmt.Errorf("list SQLite tables: %w", err)
	}
	var names []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			rows.Close()
			return nil, fmt.Errorf("read SQLite table name: %w", err)
		}
		names = append(names, name)
	}
	err = rows.Err()
	closeErr := rows.Close()
	if err != nil {
		return nil, fmt.Errorf("list SQLite tables: %w", err)
	}
	if closeErr != nil {
		return nil, fmt.Errorf("close SQLite table list: %w", closeErr)
	}

	//
	// 3. Load each table's columns after closing the discovery cursor

	// Closing the cursor first also supports connection pools limited to one connection.
	result := &types.SQLiteTables{DB: db, Tables: make(map[string]*types.SQLiteTable, len(names))}
	for _, name := range names {
		table, err := LoadSQLiteTable(db, name)
		if err != nil {
			return nil, fmt.Errorf("load SQLite table %q: %w", name, err)
		}
		result.Tables[strings.ToLower(name)] = table
	}

	//
	// 4. Connect every table to the completed collection for related-table lookups

	for _, table := range result.Tables {
		table.Prepared = result
	}
	return result, nil
}
