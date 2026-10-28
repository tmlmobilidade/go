package services

import (
	"database/sql"
	"fmt"
	"main/types"
	"net/url"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// ReadGTFSSQLite opens an existing database and prepares validator ID lookups.
// Validation adds lookup tables and indexes; the caller owns the input file.
func ReadGTFSSQLite(databasePath string) (types.Gtfs, error) {
	absolutePath, err := filepath.Abs(databasePath)
	if err != nil {
		return types.Gtfs{}, err
	}
	
	// mode=rw rejects missing files instead of silently creating an empty database.
	source := url.URL{Scheme: "file", Path: absolutePath, RawQuery: "mode=rw"}
	db, err := sql.Open("sqlite", source.String())
	if err != nil {
		return types.Gtfs{}, fmt.Errorf("open GTFS database: %w", err)
	}

	gtfs := types.NewGtfsFromSQLite(db, absolutePath)
	gtfs.IdMap, err = prepareGtfsIDMap(db)

	if err != nil {
		db.Close()
		return types.Gtfs{}, fmt.Errorf("prepare GTFS ID map: %w", err)
	}
	
	return *gtfs, nil
}
