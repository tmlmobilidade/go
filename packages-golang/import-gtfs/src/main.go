package importgtfs

/* * */

import (
	"archive/zip"
	"fmt"
	"path"
	"strings"
)

/* * */

// Imports GTFS text files into SQLite and returns the database file path.
// Columns come from CSV headers and values are preserved as TEXT, including blanks.
// Missing files, required fields and GTFS relationships are not validated.
// Existing tables are appended to; SQL and CSV errors roll back the entire import.
// Supplied database instances remain open. Memory databases are exported to disk.
func ImportGtfsToDatabase(config ImportGtfsConfig) (string, error) {
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

	for _, file := range archive.File {
		fileName := path.Base(file.Name)
		tableName, found := strings.CutSuffix(fileName, ".txt")
		if file.FileInfo().IsDir() || !found || !isGtfsTable(tableName) {
			continue
		}
		if err := importTable(transaction, file, tableName); err != nil {
			return "", fmt.Errorf("import %s: %w", file.Name, err)
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
