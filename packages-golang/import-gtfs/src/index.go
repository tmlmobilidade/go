// Package importgtfs imports GTFS ZIP archives into SQLite without GTFS validation.
// Only recognized GTFS text files are imported, with dynamic TEXT columns.
// Call ImportGtfsToMemory for a live database that the caller must close.
// Call ImportGtfsToDatabase and remove the returned file when it is no longer needed.
package importgtfs
