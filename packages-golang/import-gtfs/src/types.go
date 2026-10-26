package importgtfs

/* * */

import sqlite "github.com/tmlmobilidade/go/packages-golang/clients/sqlite/src"

/* * */

// Source of the GTFS archive. Provide exactly one of Path or Url.
type ImportGtfsConfigSource struct {
	Path string `json:"path,omitempty"`
	Url  string `json:"url,omitempty"`
}

/* * */

// Configuration options for importing GTFS data.
type ImportGtfsConfig struct {
	// Required local archive path or HTTP URL.
	Source ImportGtfsConfigSource `json:"source"`

	// Optional SQLite configuration. Defaults to a temporary database file.
	// Memory databases are exported to a temporary file after importing.
	Sqlite_config sqlite.SQLiteDatabaseConfig `json:"sqlite_config"`
}
