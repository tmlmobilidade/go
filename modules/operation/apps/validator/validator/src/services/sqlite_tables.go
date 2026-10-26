package services

import (
	"database/sql"
	"fmt"
	dbops "main/services/database"
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

	// Build these once, before validations open concurrent read cursors. Match
	// ForEachMatching's NULL-as-empty expression so SQLite can use the index.
	for _, lookup := range [][2]string{
		{"stop_times", "trip_id"},
		{"stops", "stop_id"},
		{"shapes", "shape_id"},
		{"trips", "trip_id"},
		{"trips", "route_id"},
		{"trips", "pattern_id"},
		{"trips", "shape_id"},
	} {
		table := result.tables[lookup[0]]
		if table == nil || !table.columns[lookup[1]] {
			continue
		}
		index := dbops.SanitizeColumnName("idx_validation_" + lookup[0] + "_" + lookup[1])
		query := "CREATE INDEX IF NOT EXISTS " + index + " ON " + dbops.SanitizeTableName(table.name) +
			" (COALESCE(" + dbops.SanitizeColumnName(lookup[1]) + ", ''))"
		if _, err := db.Exec(query); err != nil {
			return nil, fmt.Errorf("prepare lookup index for %s.%s: %w", table.name, lookup[1], err)
		}
	}

	// Foreign-key checks use raw equality, which cannot use the COALESCE
	// indexes above. Cover the referenced columns across all validators, and
	// keep both forms so NULL handling stays unchanged.
	for _, lookup := range [][2]string{
		{"agency", "agency_id"},
		{"calendar", "service_id"},
		{"calendar_dates", "service_id"},
		{"fare_attributes", "fare_id"},
		{"routes", "route_id"},
		{"shapes", "shape_id"},
		{"stops", "stop_id"},
		{"stops", "zone_id"},
		{"stops", "parent_station"}, // ParentStationForeign currently counts equal parent values.
		{"trips", "trip_id"},
	} {
		table := result.tables[lookup[0]]
		if table == nil || !table.columns[lookup[1]] {
			continue
		}
		index := dbops.SanitizeColumnName("idx_validation_foreign_" + lookup[0] + "_" + lookup[1])
		query := "CREATE INDEX IF NOT EXISTS " + index + " ON " + dbops.SanitizeTableName(table.name) +
			" (" + dbops.SanitizeColumnName(lookup[1]) + ")"
		if _, err := db.Exec(query); err != nil {
			return nil, fmt.Errorf("prepare foreign-key index for %s.%s: %w", table.name, lookup[1], err)
		}
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

// ForEachRow iterates a prepared table without requiring a separate handle.
func (t *SQLiteTables) ForEachRow(name string, fn func(*SQLiteRow) error) error {
	table, err := t.Table(name)
	if err != nil {
		return err
	}
	return table.ForEachRow(fn)
}
