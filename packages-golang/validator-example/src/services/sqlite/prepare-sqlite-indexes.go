package sqlite

import (
	"database/sql"
	"fmt"
)

// PrepareSQLiteIndexes creates validation lookup indexes before concurrent checks start.
// Missing tables or columns are left for GTFS rules to report. Imported values are unchanged.
func PrepareSQLiteIndexes(db *sql.DB) error {
	//

	//
	// 1. Require a database connection

	if db == nil {
		return fmt.Errorf("database connection is nil")
	}

	//
	// 2. Create all indexes in one transaction so a failure leaves no partial setup

	transaction, err := db.Begin()
	if err != nil {
		return fmt.Errorf("begin SQLite index preparation: %w", err)
	}
	defer transaction.Rollback()

	//
	// 3. Index NULL-as-empty lookups used by matching-row and grouping queries

	if err := PrepareIndexes(transaction, [][2]string{
		{"stop_times", "trip_id"},
		{"stops", "stop_id"},
		{"shapes", "shape_id"},
		{"trips", "trip_id"},
		{"trips", "route_id"},
		{"trips", "pattern_id"},
		{"trips", "shape_id"},
	}, true); err != nil {
		return err
	}

	//
	// 4. Index raw equality lookups used by foreign-reference checks

	// Equality on a column cannot use an index on COALESCE(column, ''), so both forms are needed.
	if err := PrepareIndexes(transaction, [][2]string{
		{"agency", "agency_id"},
		{"calendar", "service_id"},
		{"calendar_dates", "service_id"},
		{"fare_attributes", "fare_id"},
		{"routes", "route_id"},
		{"shapes", "shape_id"},
		{"stop_times", "stop_id"},
		{"stop_times", "location_id"},
		{"stops", "stop_id"},
		{"stops", "zone_id"},
		{"stops", "parent_station"},
		{"trips", "trip_id"},
	}, false); err != nil {
		return err
	}

	//
	// 5. Commit the completed index setup before validation starts

	if err := transaction.Commit(); err != nil {
		return fmt.Errorf("commit SQLite index preparation: %w", err)
	}
	return nil
}