package sqlite

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

/*
* ReadGTFSSQLite opens an existing regular SQLite file produced by import-gtfs.
* The path is resolved before opening in read-write mode, without creating files.
* The schema query verifies the file format and connection, not GTFS completeness;
* missing GTFS tables remain the responsibility of configured validation rules.
* Rows stay on disk. The caller closes the returned pool and retains the input file.
* A failed schema query closes the pool before returning the error.
 */
func ReadGTFSSQLite(databasePath string) (*sql.DB, error) {
	//

	//
	// 1. Resolve the supplied database path and require an existing regular file

	if databasePath == "" {
		return nil, fmt.Errorf("GTFS SQLite database path is required")
	}

	absolutePath, err := filepath.Abs(databasePath)
	if err != nil {
		return nil, fmt.Errorf("resolve GTFS SQLite database path: %w", err)
	}

	info, err := os.Stat(absolutePath)
	if err != nil {
		return nil, fmt.Errorf("open GTFS SQLite database %q: %w", absolutePath, err)
	}

	if !info.Mode().IsRegular() {
		return nil, fmt.Errorf("GTFS SQLite database %q is not a regular file", absolutePath)
	}

	//
	// 2. Open the database without creating a file when the path is missing

	// Validation may add indexes later, so the existing database must be writable.
	source := url.URL{Scheme: "file", Path: absolutePath, RawQuery: "mode=rw"}
	db, err := sql.Open("sqlite", source.String())
	if err != nil {
		return nil, fmt.Errorf("open GTFS SQLite database %q: %w", absolutePath, err)
	}

	//
	// 3. Read SQLite metadata to verify the connection and database format

	// sql.Open is lazy. Querying the schema catches invalid SQLite files now,
	// while leaving missing GTFS tables for the configured validation rules.
	var tables int
	if err := db.QueryRow("SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table'").Scan(&tables); err != nil {
		db.Close()
		return nil, fmt.Errorf("read GTFS SQLite database %q: %w", absolutePath, err)
	}

	//
	// 4. Return the connection for table preparation and validation queries

	return db, nil
}
