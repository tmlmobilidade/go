package database

import (
	"database/sql"
	"fmt"
	"strings"
)

// CreateTableIfNotExists creates a SQLite table with the given headers
func CreateTableIfNotExists(db *sql.DB, table string, headers []string) error {
	if db == nil {
		return fmt.Errorf("database connection is nil")
	}

	var cols []string
	for _, h := range headers {
		// Sanitize column name (SQLite identifiers)
		colName := SanitizeColumnName(h)
		col := fmt.Sprintf("%s TEXT", colName)
		cols = append(cols, col)
	}

	sql := fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s (%s);", SanitizeTableName(table), strings.Join(cols, ","))
	_, err := db.Exec(sql)
	if err != nil {
		return fmt.Errorf("failed to create table %s: %w", table, err)
	}
	return nil
}

// SanitizeColumnName quotes a CSV header for SQLite without changing its name.
func SanitizeColumnName(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}

// SanitizeTableName quotes a file's table name without changing it.
func SanitizeTableName(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}

// TableExists checks if a table exists in the database
func TableExists(db *sql.DB, tableName string) (bool, error) {
	if db == nil {
		return false, fmt.Errorf("database connection is nil")
	}

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

// GetTableCount returns the number of rows in a table
func GetTableCount(db *sql.DB, tableName string) (int, error) {
	if db == nil {
		return 0, fmt.Errorf("database connection is nil")
	}

	query := fmt.Sprintf("SELECT COUNT(*) FROM %s", SanitizeTableName(tableName))
	var count int
	err := db.QueryRow(query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get table count for %s: %w", tableName, err)
	}
	return count, nil
}
