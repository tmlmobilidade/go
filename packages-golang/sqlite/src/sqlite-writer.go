package sqlite

/* * */

import (
	"os"
	"path/filepath"
)

// Deprecated: Use SQLiteDatabase instead.
type SQLiteWriter[T any] struct {
	*SQLiteTableInstance[T]

	// Properties
	InstanceName string
	InstancePath string
}

// Constructor
func NewSQLiteWriter[T any](params SQLiteTable[T]) (*SQLiteWriter[T], error) {
	// Otherwise, generate a random instance name and path
	// and create a new database instance
	instanceName := generateRandomString()
	instancePath := filepath.Join(os.TempDir(), instanceName+".db")
	db, err := createDatabase(instancePath, "OFF")
	if err != nil {
		return nil, err
	}
	table, err := NewSQLiteTableInstance(db, instanceName, params)
	if err != nil {
		db.Close()
		removeDatabase(instancePath)
		return nil, err
	}
	return &SQLiteWriter[T]{SQLiteTableInstance: table, InstanceName: instanceName, InstancePath: instancePath}, nil
}

// Closes the database instance and removes its temporary files.
func (writer *SQLiteWriter[T]) Cleanup() error {
	if err := writer.databaseInstance.Close(); err != nil {
		return err
	}
	return removeDatabase(writer.InstancePath)
}
