package services

import (
	"database/sql"
	"fmt"
	"main/lib"
	"main/types"
	"os"

	_ "modernc.org/sqlite"
)

// ReadGTFSZip reads and parses a GTFS zip file at the specified path using SQLite for efficient streaming.
// It returns a Gtfs struct with SQLite database connection. The database file is kept during validation
// and should be cleaned up by calling gtfs.Close() after use.
func ReadGTFSZip(zipPath string) (types.Gtfs, error) {
	if _, err := os.Stat(zipPath); os.IsNotExist(err) {
		return types.Gtfs{}, fmt.Errorf("file %s does not exist", zipPath)
	}

	//
	// 1. Create a temporary SQLite database for this GTFS import
	tmpDB, err := os.CreateTemp("", "gtfs_*.db")
	if err != nil {
		return types.Gtfs{}, fmt.Errorf("failed to create temporary database: %w", err)
	}
	tmpDBPath := tmpDB.Name()
	tmpDB.Close()
	lib.AppLogger.Debug(fmt.Sprintf("Created temporary SQLite database: %s", tmpDBPath))

	//
	// 2. Import GTFS zip to SQLite using streaming parser
	gtfsDB, err := ImportGTFSZipToSQLite(zipPath, tmpDBPath)
	if err != nil {
		os.Remove(tmpDBPath) // Clean up on error
		return types.Gtfs{}, fmt.Errorf("failed to import GTFS to SQLite: %w", err)
	}
	gtfsDB.Close() // Close the import connection

	//
	// 3. Open a new connection for the Gtfs struct
	db, err := sql.Open("sqlite", tmpDBPath)
	if err != nil {
		os.Remove(tmpDBPath) // Clean up on error
		return types.Gtfs{}, fmt.Errorf("failed to open database: %w", err)
	}

	//
	// 4. Create Gtfs struct with SQLite connection
	gtfs := types.NewGtfsFromSQLite(db, tmpDBPath)

	//
	// 5. Load ID map from SQLite
	gtfsIdsMap, err := LoadIdMapFromSQLite(db)
	if err != nil {
		gtfs.Close()
		os.Remove(tmpDBPath)
		return types.Gtfs{}, fmt.Errorf("failed to load ID map: %w", err)
	}
	gtfs.IdMap = gtfsIdsMap

	return *gtfs, nil
}
