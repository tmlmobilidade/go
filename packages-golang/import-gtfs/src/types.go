package importgtfs

/* * */

import sqlite "github.com/tmlmobilidade/go/packages-golang/sqlite/src"

/* * */

// Identifies the GTFS ZIP. Provide exactly one of Path or Url.
// The json labels give the corresponding property names in JSON configuration.
type ImportGtfsConfigSource struct {
	// Path is a local file path; Url is an HTTP or HTTPS download address.
	Path string `json:"path,omitempty"`
	Url  string `json:"url,omitempty"`
}

/* * */

// Selects service dates, written as YYYYMMDD integers.
// For example, 20261027 means 27 October 2026.
// When a range and individual dates are both set, a date must match both.
// An empty list of individual dates is ignored.
type ImportGtfsConfigTimeRange struct {
	// A pointer (*) allows the range to be omitted; nil means no range was supplied.
	Date_range *ImportGtfsConfigDateRange `json:"date_range,omitempty"`

	// Discrete_dates lists individual dates to keep, such as []int{20261027}.
	Discrete_dates []int `json:"discrete_dates,omitempty"`
}

// Includes both Start and End in the selected period.
type ImportGtfsConfigDateRange struct {
	End   int `json:"end"`
	Start int `json:"start"`
}

/* * */

// Groups the source, output database settings, and date selection.
type ImportGtfsConfig struct {
	// Required local archive path or HTTP URL.
	Source ImportGtfsConfigSource `json:"source"`

	// Optional SQLite configuration. Defaults to a temporary database file.
	// ImportGtfsToDatabase exports memory databases to a temporary file.
	// Use ImportGtfsToMemory to retain a live in-memory database instead.
	Sqlite_config sqlite.SQLiteDatabaseConfig `json:"sqlite_config"`

	// Select active dates and keep their trips, stop times, routes, shapes, and stops.
	// Leave nil to copy the original data without date filtering.
	Time_range *ImportGtfsConfigTimeRange `json:"time_range,omitempty"`
}
