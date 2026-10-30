package services

import (
	"database/sql"
	"fmt"
	"main/types"
	"slices"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator/src/services/database"
)

// prepareGtfsIDMap builds the validator's legacy ID lookups from imported rows.
// Composite keys retain the existing per-field mapping and zero-based row indices.
func prepareGtfsIDMap(db *sql.DB) (types.GtfsIdMap, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(`
        CREATE TABLE IF NOT EXISTS id_map (
            file TEXT NOT NULL,
            key TEXT NOT NULL,
            row_index INTEGER NOT NULL,
            PRIMARY KEY (file, key, row_index)
        );
        CREATE INDEX IF NOT EXISTS idx_id_map_file_key ON id_map(file, key);
        DELETE FROM id_map;
    `); err != nil {
		return nil, err
	}

	for table, primaryKey := range types.GTFS_PRIMARY_KEYS {
		var keys []string
		switch key := primaryKey.(type) {
		case string:
			keys = []string{key}
		case []string:
			keys = key
		default:
			continue
		}
		var exists bool
		if err := tx.QueryRow("SELECT EXISTS(SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = ?)", table).Scan(&exists); err != nil {
			return nil, err
		}
		if !exists {
			continue
		}
		rows, err := tx.Query("SELECT * FROM " + dbops.SanitizeTableName(table) + " LIMIT 0")
		if err != nil {
			return nil, err
		}
		columns, err := rows.Columns()
		rows.Close()
		if err != nil {
			return nil, err
		}
		for _, key := range keys {
			// Missing ID fields belong to validation, not import errors.
			if !slices.Contains(columns, key) {
				continue
			}
			column := dbops.SanitizeColumnName(key)
			query := "INSERT OR IGNORE INTO id_map (file, key, row_index) SELECT ?, " + column +
				", rowid - 1 FROM " + dbops.SanitizeTableName(table) + " WHERE " + column + " <> ''"
			if _, err := tx.Exec(query, table); err != nil {
				return nil, err
			}
		}
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return LoadIdMapFromSQLite(db)
}

// LoadIdMapFromSQLite loads the ID map from SQLite into a Go map
func LoadIdMapFromSQLite(db *sql.DB) (types.GtfsIdMap, error) {
	idMap := make(types.GtfsIdMap)

	rows, err := db.Query("SELECT file, key, row_index FROM id_map ORDER BY file, key, row_index")
	if err != nil {
		return nil, fmt.Errorf("failed to query id_map: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var file, key string
		var rowIndex int
		if err := rows.Scan(&file, &key, &rowIndex); err != nil {
			return nil, fmt.Errorf("failed to scan id_map row: %w", err)
		}

		if idMap[file] == nil {
			idMap[file] = make(map[string][]int)
		}
		idMap[file][key] = append(idMap[file][key], rowIndex)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to iterate id_map rows: %w", err)
	}

	return idMap, nil
}
