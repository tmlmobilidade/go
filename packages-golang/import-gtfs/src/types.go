package importgtfs

/* * */

import sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"

/* * */

// Source of the GTFS archive. Provide exactly one of Path or Url.
type ImportGtfsConfigSource struct {
	Path string `json:"path,omitempty"`
	Url  string `json:"url,omitempty"`
}

/* * */

// Optional inclusive date range and discrete service dates, in YYYYMMDD format.
// When both are set, a date must match both. An empty discrete list is ignored.
type ImportGtfsConfigTimeRange struct {
	Date_range     *ImportGtfsConfigDateRange `json:"date_range,omitempty"`
	Discrete_dates []int                      `json:"discrete_dates,omitempty"`
}

type ImportGtfsConfigDateRange struct {
	End   int `json:"end"`
	Start int `json:"start"`
}

/* * */

// Configuration options for importing GTFS data.
type ImportGtfsConfig struct {
	// Required local archive path or HTTP URL.
	Source ImportGtfsConfigSource `json:"source"`

	// Optional SQLite configuration. Defaults to a temporary database file.
	// Memory databases are exported to a temporary file after importing.
	Sqlite_config sqlite.SQLiteDatabaseConfig `json:"sqlite_config"`

	// Resolve service dates and filter trips and their dependencies. Omit for a raw import.
	Time_range *ImportGtfsConfigTimeRange `json:"time_range,omitempty"`
}
