package services

import (
	"database/sql"
	"fmt"
	"strings"
)

// SQLiteTables is an immutable collection prepared before concurrent validations.
// It shares table metadata and the connection pool, never row values.
type SQLiteTables struct {
	db     *sql.DB
	tables map[string]*SQLiteTable
}

func PrepareSQLiteTables(db *sql.DB) (*SQLiteTables, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection is nil")
	}
	rows, err := db.Query("SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT GLOB 'sqlite_*' ORDER BY name")
	if err != nil {
		return nil, fmt.Errorf("list SQLite tables: %w", err)
	}
	var names []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			rows.Close()
			return nil, err
		}
		names = append(names, name)
	}
	err = rows.Err()
	rows.Close()
	if err != nil {
		return nil, err
	}
	result := &SQLiteTables{db: db, tables: make(map[string]*SQLiteTable, len(names))}
	for _, name := range names {
		table, err := NewSQLiteTable(db, name)
		if err != nil {
			return nil, fmt.Errorf("prepare table %s: %w", name, err)
		}
		table.prepared = result
		result.tables[strings.ToLower(name)] = table
	}
	return result, nil
}

// Table selects an already-prepared handle without issuing a SQL query.
func (t *SQLiteTables) Table(name string) (*SQLiteTable, error) {
	if t == nil {
		return nil, fmt.Errorf("SQLite tables are not prepared")
	}
	table, ok := t.tables[strings.ToLower(name)]
	if !ok {
		return nil, fmt.Errorf("SQLite table %q is not available", name)
	}
	return table, nil
}

func (t *SQLiteTables) Has(name string) bool {
	if t == nil {
		return false
	}
	_, ok := t.tables[strings.ToLower(name)]
	return ok
}

// ValidationTables reuses the collection supplied by the dispatcher. Direct
// callers, such as focused tests, can omit it to prepare their fixture once.
func ValidationTables(db *sql.DB, prepared ...*SQLiteTables) (*SQLiteTables, error) {
	if len(prepared) > 0 && prepared[0] != nil {
		if prepared[0].db != db {
			return nil, fmt.Errorf("prepared tables belong to a different database")
		}
		return prepared[0], nil
	}
	return PrepareSQLiteTables(db)
}
