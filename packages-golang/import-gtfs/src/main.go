package importgtfs

/* * */

import (
	"archive/zip"
	"crypto/rand"
	"fmt"
	"path"
	"strings"
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

	// Open the source archive without extracting its entries to disk.
	sourcePath, cleanup, err := prepareSource(config.Source)
	if err != nil {
		return "", err
	}
	defer cleanup()
	archive, err := zip.OpenReader(sourcePath)
	if err != nil {
		return "", err
	}
	defer archive.Close()

	// Prepare the database and keep all table imports in one transaction.
	database, instancePath, temporaryDirectory, err := prepareDatabase(config.Sqlite_config)
	if err != nil {
		return "", err
	}
	completed := false
	defer func() {
		cleanupDatabase(database, config.Sqlite_config.DatabaseInstance == nil, temporaryDirectory, completed)
	}()
	transaction, err := database.DatabaseInstance.Begin()
	if err != nil {
		return "", err
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
			return "", fmt.Errorf("import %s: %w", file.Name, err)
		}
	}
	if dateFilter != nil {
		if err := filterServiceDates(transaction, staged, prefix, config.Time_range, dateFilter); err != nil {
			return "", err
		}
	}
	if err := transaction.Commit(); err != nil {
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
