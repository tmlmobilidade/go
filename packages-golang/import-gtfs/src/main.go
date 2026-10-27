package importgtfs

/* * */

import (
	"archive/zip"
	"crypto/rand"
	"database/sql"
	"fmt"
	"path"
	"strings"

	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

/* * */

// Imports GTFS text files into SQLite and returns the database file path.
// Columns come from CSV headers. Empty fields become NULL; other values remain TEXT.
// Raw imports do not validate required fields or GTFS relationships.
// A nonempty time_range resolves calendars and filters trips and their dependencies.
// Existing tables are appended to; SQL and CSV errors roll back the entire import.
// Supplied database instances remain open. Memory databases are exported to disk.
func ImportGtfsToDatabase(config ImportGtfsConfig) (string, error) {
	dateFilter, err := prepareDateFilter(config.Time_range)
	if err != nil {
		return "", err
	}

	archive, cleanup, err := prepareSource(config.Source)
	if err != nil {
		return "", err
	}
	defer cleanup()

	// Prepare the database and keep all table imports in one transaction.
	database, instancePath, temporaryDirectory, err := prepareDatabase(config.Sqlite_config)
	if err != nil {
		return "", err
	}
	completed := false
	defer func() {
		cleanupDatabase(database, config.Sqlite_config.DatabaseInstance == nil, temporaryDirectory, completed)
	}()
	if err := importGtfsTables(config, database.DatabaseInstance, archive, dateFilter); err != nil {
		return "", err
	}

	// Persist memory databases so every successful import returns a usable file.
	databasePath, err := databaseFilePath(database.DatabaseInstance)
	if err != nil {
		return "", err
	}
	if databasePath == "" {
		if _, err := database.DatabaseInstance.Exec("VACUUM INTO ?", instancePath); err != nil {
			return "", err
		}
	}
	if config.Sqlite_config.DatabaseInstance == nil {
		if err := database.DatabaseInstance.Close(); err != nil {
			return "", err
		}
	}
	completed = true
	return instancePath, nil
}

// ImportGtfsToMemory imports into a live in-memory database without exporting a file.
// The caller must close the returned database. A supplied instance remains caller-owned.
func ImportGtfsToMemory(config ImportGtfsConfig) (*sqlite.SQLiteDatabase, error) {
	dateFilter, err := prepareDateFilter(config.Time_range)
	if err != nil {
		return nil, err
	}

	archive, cleanup, err := prepareSource(config.Source)
	if err != nil {
		return nil, err
	}
	defer cleanup()

	config.Sqlite_config.Memory = true
	config.Sqlite_config.InstancePath = ""
	if config.Sqlite_config.DatabaseInstance != nil {
		databasePath, err := databaseFilePath(config.Sqlite_config.DatabaseInstance)
		if err != nil {
			return nil, err
		}
		if databasePath != "" {
			return nil, fmt.Errorf("ImportGtfsToMemory requires an in-memory database instance")
		}
	}
	database, err := sqlite.NewSQLiteDatabase(config.Sqlite_config)
	if err != nil {
		return nil, err
	}
	if err := importGtfsTables(config, database.DatabaseInstance, archive, dateFilter); err != nil {
		if config.Sqlite_config.DatabaseInstance == nil {
			database.DatabaseInstance.Close()
		}
		return nil, err
	}
	return database, nil
}

func importGtfsTables(config ImportGtfsConfig, instance *sql.DB, archive *zip.ReadCloser, dateFilter func(string) bool) error {
	transaction, err := instance.Begin()
	if err != nil {
		return err
	}
	defer transaction.Rollback()

	staged := make(map[string]string)
	prefix := "import_gtfs_" + rand.Text() + "_"
	for _, file := range archive.File {
		fileName := path.Base(file.Name)
		tableName, found := strings.CutSuffix(fileName, ".txt")
		if file.FileInfo().IsDir() || !found || !isGtfsTable(tableName) {
			continue
		}
		target := tableName
		if dateFilter != nil {
			target = prefix + tableName
			staged[tableName] = target
		}
		if err := importTable(transaction, file, target, dateFilter != nil); err != nil {
			return fmt.Errorf("import %s: %w", file.Name, err)
		}
	}
	if dateFilter != nil {
		if err := filterServiceDates(transaction, staged, prefix, config.Time_range, dateFilter); err != nil {
			return err
		}
	}
	if err := transaction.Commit(); err != nil {
		return err
	}

	return nil
}
