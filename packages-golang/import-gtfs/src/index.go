// Package importgtfs copies GTFS (General Transit Feed Specification) ZIP files
// into SQLite, a database stored in a single file or held in memory.
// Only recognized GTFS text files are imported. Their headers become columns,
// and values are kept as text without checking the full GTFS specification.
// Call ImportGtfsToMemory for a live database that the caller must close.
// Call ImportGtfsToDatabase and remove the returned file when it is no longer needed.
package importgtfs
