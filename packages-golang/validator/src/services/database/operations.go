package database

import (
	"database/sql"
	"fmt"
	"strings"
)

// CreateTableIfNotExists creates a SQLite table with the given headers
func CreateTableIfNotExists(db *sql.DB, table string, headers []string) error {
	//

	//
	// 1. Check if database connection is nil

	if db == nil {
		return fmt.Errorf("database connection is nil")
	}

	//
	// 2. Create columns

	var cols []string
	for _, h := range headers {
		//
		// 3. Sanitize column name (SQLite identifiers)

		colName := SanitizeColumnName(h)
		col := fmt.Sprintf("%s TEXT", colName)
		cols = append(cols, col)
	}

	//
	// 4. Create table

	sql := fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s (%s);", SanitizeTableName(table), strings.Join(cols, ","))
	_, err := db.Exec(sql)
	if err != nil {
		return fmt.Errorf("failed to create table %s: %w", table, err)
	}

	//
	// 5. Return nil

	return nil
}

// TableExists checks if a table exists in the database
func TableExists(db *sql.DB, tableName string) (bool, error) {
	//

	//
	// 1. Check if database connection is nil

	if db == nil {
		return false, fmt.Errorf("database connection is nil")
	}

	//
	// 2. Check if table exists

	query := "SELECT name FROM sqlite_master WHERE type='table' AND name = ? COLLATE NOCASE"
	var name string
	err := db.QueryRow(query, tableName).Scan(&name)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("failed to check if table exists: %w", err)
	}
	return true, nil
}
