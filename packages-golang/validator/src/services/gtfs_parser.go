package services

import (
	"database/sql"
	"fmt"
	"main/types"
	"os"

	importgtfs "github.com/tmlmobilidade/go/packages-golang/import-gtfs/src"
	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/config"

	_ "modernc.org/sqlite"
)

// ReadGTFSZip loads a feed with the shared importer and prepares validator ID lookups.
// The caller owns the returned connection and temporary database file.
func ReadGTFSZip(zipPath string) (types.Gtfs, error) {
	tmpDB, err := os.CreateTemp("", "gtfs_*.db")
	if err != nil {
		return types.Gtfs{}, fmt.Errorf("create temporary GTFS database: %w", err)
	}
	tmpDBPath := tmpDB.Name()
	completed := false
	defer func() {
		if !completed {
			for _, suffix := range []string{"", "-wal", "-shm"} {
				os.Remove(tmpDBPath + suffix)
			}
		}
	}()
	if err := tmpDB.Close(); err != nil {
		return types.Gtfs{}, err
	}

	// Supply the pure-Go driver so the validator can still build with CGO_ENABLED=0.
	// ZIP reading, CSV parsing and transactional inserts belong to import-gtfs.
	db, err := sql.Open("sqlite", tmpDBPath)
	if err != nil {
		return types.Gtfs{}, err
	}
	defer func() {
		if !completed {
			db.Close()
		}
	}()
	_, err = importgtfs.ImportGtfsToDatabase(importgtfs.ImportGtfsConfig{
		AdditionalTables: config.GTFSTables,
		Source:           importgtfs.ImportGtfsConfigSource{Path: zipPath},
		Sqlite_config:    sqlite.SQLiteDatabaseConfig{DatabaseInstance: db},
	})
	if err != nil {
		return types.Gtfs{}, fmt.Errorf("import GTFS: %w", err)
	}

	gtfs := types.NewGtfsFromSQLite(db, tmpDBPath)
	gtfs.IdMap, err = prepareGtfsIDMap(db)
	if err != nil {
		return types.Gtfs{}, fmt.Errorf("prepare GTFS ID map: %w", err)
	}

	// The importer serializes writes. Validation callbacks need additional
	// connections to query related rows while their outer cursor stays open.
	db.SetMaxOpenConns(0)
	completed = true
	return *gtfs, nil
}
