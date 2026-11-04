package importgtfs

/* * */

import (
	"crypto/rand"
	"database/sql"
	"os"
	"path/filepath"

	sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"
)

/* * */

// Chooses an output path and opens or reuses a database.
// It also returns the temporary directory, if any, so failed imports can remove it.
func prepareDatabase(config sqlite.SQLiteDatabaseConfig) (*sqlite.SQLiteDatabase, string, string, error) {
	// For a supplied connection, ask SQLite where its data actually lives.
	if config.DatabaseInstance != nil {
		instancePath, err := databaseFilePath(config.DatabaseInstance)
		if err != nil {
			return nil, "", "", err
		}
		config.InstancePath = instancePath
		config.Memory = instancePath == ""
	}

	// Reserve a temporary output location when no path was chosen, or when
	// an in-memory database will need to be exported to a file.
	instancePath := config.InstancePath
	temporaryDirectory := ""
	if config.Memory || instancePath == "" {
		var err error
		temporaryDirectory, err = os.MkdirTemp("", "import-gtfs-*")
		if err != nil {
			return nil, "", "", err
		}
		instanceName := config.InstanceName
		if instanceName == "" {
			instanceName = rand.Text()
		}
		instancePath = filepath.Join(temporaryDirectory, filepath.Base(instanceName)+".db")
	}

	// Return an absolute path so callers can use it from any working directory.
	instancePath, err := filepath.Abs(instancePath)
	if err != nil {
		os.RemoveAll(temporaryDirectory)
		return nil, "", "", err
	}

	// Open the database, removing our temporary directory if opening fails.
	config.InstancePath = instancePath
	database, err := sqlite.NewSQLiteDatabase(config)
	if err != nil {
		os.RemoveAll(temporaryDirectory)
		return nil, "", "", err
	}
	return database, instancePath, temporaryDirectory, nil
}

// Asks SQLite for the path of its main database.
// PRAGMA database_list is a SQLite command listing connected databases.
// An empty path means the main database lives in memory.
func databaseFilePath(databaseInstance *sql.DB) (string, error) {
	rows, err := databaseInstance.Query("PRAGMA database_list")
	if err != nil {
		return "", err
	}
	defer rows.Close()

	// Scan copies each result row into the variables listed below.
	for rows.Next() {
		var sequence int
		var name, instancePath string
		if err := rows.Scan(&sequence, &name, &instancePath); err != nil {
			return "", err
		}
		if name == "main" {
			return instancePath, nil
		}
	}
	return "", rows.Err()
}

// Closes only connections created by the importer.
// Failed imports also remove their temporary output; successful files are retained.
func cleanupDatabase(database *sqlite.SQLiteDatabase, owned bool, temporaryDirectory string, completed bool) {
	if owned {
		database.DatabaseInstance.Close()
	}
	if !completed && temporaryDirectory != "" {
		os.RemoveAll(temporaryDirectory)
	}
}
