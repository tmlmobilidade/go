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

// Resolves the output path while preserving ownership of supplied databases.
func prepareDatabase(config sqlite.SQLiteDatabaseConfig) (*sqlite.SQLiteDatabase, string, string, error) {
	if config.DatabaseInstance != nil {
		instancePath, err := databaseFilePath(config.DatabaseInstance)
		if err != nil {
			return nil, "", "", err
		}
		config.InstancePath = instancePath
		config.Memory = instancePath == ""
	}

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
	instancePath, err := filepath.Abs(instancePath)
	if err != nil {
		os.RemoveAll(temporaryDirectory)
		return nil, "", "", err
	}
	config.InstancePath = instancePath
	database, err := sqlite.NewSQLiteDatabase(config)
	if err != nil {
		os.RemoveAll(temporaryDirectory)
		return nil, "", "", err
	}
	return database, instancePath, temporaryDirectory, nil
}

// Reads the real main database path instead of relying on caller configuration.
// SQLite returns an empty path for memory databases.
func databaseFilePath(databaseInstance *sql.DB) (string, error) {
	rows, err := databaseInstance.Query("PRAGMA database_list")
	if err != nil {
		return "", err
	}
	defer rows.Close()
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

// Removes only importer-created temporary output on failure.
func cleanupDatabase(database *sqlite.SQLiteDatabase, owned bool, temporaryDirectory string, completed bool) {
	if owned {
		database.DatabaseInstance.Close()
	}
	if !completed && temporaryDirectory != "" {
		os.RemoveAll(temporaryDirectory)
	}
}
