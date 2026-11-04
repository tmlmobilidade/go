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
	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
)

/* * */

// Imports GTFS text files into SQLite and returns the database file path.
// Columns come from CSV headers. Empty fields become NULL; other values remain TEXT.
// Raw imports do not validate required fields or GTFS relationships.
// A nonempty time_range resolves calendars and filters trips and their dependencies.
// Existing tables are appended to; SQL and CSV errors roll back the entire import.
// Supplied database instances remain open. Memory databases are exported to disk.
func ImportGtfsToDatabase(config ImportGtfsConfig) (string, error) {
	// Check the requested dates before downloading files or creating a database.
	dateFilter, err := prepareDateFilter(config.Time_range)
	if err != nil {
		return "", err
	}

	// Open the ZIP and arrange to close it when this function returns.
	// In Go, defer schedules cleanup for every return path, including errors.
	archive, cleanup, err := prepareSource(config.Source)
	if err != nil {
		return "", err
	}
	defer cleanup()

	// Prepare the output and arrange cleanup if any later step fails.
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

	// Keep the finished output file; the caller is responsible for removing it.
	completed = true
	return instancePath, nil
}

// Imports into a live in-memory database without exporting a file.
// The caller must close the returned database. A supplied instance remains caller-owned.
func ImportGtfsToMemory(config ImportGtfsConfig) (*sqlite.SQLiteDatabase, error) {
	// Validate dates and open the source before creating the in-memory database.
	dateFilter, err := prepareDateFilter(config.Time_range)
	if err != nil {
		return nil, err
	}

	archive, cleanup, err := prepareSource(config.Source)
	if err != nil {
		return nil, err
	}
	defer cleanup()

	// This entry point must keep data in memory, even if a file path was supplied.
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

	// Close a database we created if the import fails. A supplied database stays open.
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

// Imports all recognized files as one database operation.
// A transaction saves every change together, or undoes them all on failure.
func importGtfsTables(config ImportGtfsConfig, instance *sql.DB, archive *zip.ReadCloser, dateFilter func(string) bool) error {
	timer := telemetry.NewTimer()
	telemetry.Logger.Info("Importing GTFS tables")
	transaction, err := instance.Begin()
	if err != nil {
		return err
	}
	// Rollback undoes unfinished work; after a successful commit it has no effect.
	defer transaction.Rollback()

	// With date filtering, load incoming rows into temporary tables first.
	// Unique names keep them separate from existing tables in the same database.
	staged := make(map[string]string)
	prefix := "import_gtfs_" + rand.Text() + "_"
	for _, file := range archive.File {
		// Files may be nested inside ZIP folders; only the final name identifies a table.
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

		telemetry.Logger.Progress(telemetry.LogEntry{
			Message:    "Importing GTFS table " + fileName,
			Attributes: map[string]any{"table": tableName},
		})
		if err := importTable(transaction, file, target, dateFilter != nil); err != nil {
			return fmt.Errorf("import %s: %w", file.Name, err)
		}
	}

	// Filter only the incoming rows, then copy the retained rows into the output.
	if dateFilter != nil {
		telemetry.Logger.Progress("Filtering GTFS service dates and dependencies")
		if err := filterServiceDates(transaction, staged, prefix, config.Time_range, dateFilter); err != nil {
			return err
		}
	}

	// Make all imported rows permanent only after every file and filter succeeds.
	if err := transaction.Commit(); err != nil {
		return err
	}

	telemetry.Logger.Success(telemetry.LogEntry{
		Message:    "GTFS tables imported in " + timer.Get(),
		Attributes: map[string]any{"elapsed_ms": timer.GetMs()},
	})
	return nil
}
