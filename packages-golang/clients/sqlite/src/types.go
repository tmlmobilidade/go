package sqlite

/* * */

import "database/sql"

/* * */

type SQLiteDatabaseConfig struct {
	// The database instance to use.
	// If not provided, a temporary database will be created.
	DatabaseInstance *sql.DB `json:"-"`

	// Optional custom instance name.
	// If not provided, a random name will be generated.
	InstanceName string `json:"instanceName,omitempty"`

	// Optional custom database file path.
	// If not provided, a temporary file path will be generated.
	InstancePath string `json:"instancePath,omitempty"`

	// If true, the database will be created in memory.
	// Defaults to false.
	// Note: If using in-memory, data will be lost when the process exits.
	// Also, multiple instances will not share the same data.
	// Use only for testing or ephemeral data storage.
	// If true, InstancePath is ignored.
	Memory bool `json:"memory,omitempty"`
}

/* * */

type SQLiteColumn[T any] struct {
	Indexed     bool
	Name        string
	Not_null    bool
	Primary_key bool
	Type        string // BLOB, BOOLEAN, INTEGER, REAL or TEXT.
}

/* * */

type SQLiteTable[T any] struct {
	// The maximum number of items to hold in memory
	// before flushing to the database.
	// Defaults to 3000.
	Batch_size int

	// Columns in the table.
	// Order matters for INSERT.
	// Must be keys of T or custom names.
	Columns []SQLiteColumn[T]
}
