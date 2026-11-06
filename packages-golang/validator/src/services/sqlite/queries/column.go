package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
)

// rowQuerier lets schema checks use either a connection pool or an active transaction.
type rowQuerier interface {
	QueryRow(string, ...any) *sql.Row
}

// column resolves a field against the live schema before building a data query.
// Absent fields become SQL NULL so validation can report missing CSV headers.
func column(table *types.SQLiteTable, alias, field string) (string, error) {
	//
	// 1. Require a table and its database connection

	if table == nil || table.DB == nil {
		return "", fmt.Errorf("SQLite table and database connection are required")
	}

	//
	// 2. Use a quoted column identifier only when the field exists

	exists, err := columnExists(table.DB, table.Name, field)
	if err != nil {
		return "", err
	}
	if !exists {
		return "NULL", nil
	}
	return alias + "." + dbops.SanitizeName(field), nil
}

// columnExists includes generated columns and excludes hidden virtual-table columns,
// matching the columns exposed by SELECT *. The result is never cached.
func columnExists(db rowQuerier, table, field string) (bool, error) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM pragma_table_xinfo(?) WHERE name = ? AND hidden != 1)", table, field).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check SQLite column %s.%s: %w", table, field, err)
	}
	return exists, nil
}
