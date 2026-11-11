package sqlite

import (
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/services/sqlite/queries"
)

/*
* PrepareSQLiteIndexes prepares the configured validation lookups before checks
* start. It owns one transaction for all index creation and commits only after
* every lookup succeeds; failures roll back the partial setup.
* Missing tables and columns are skipped for GTFS rules to report. Existing
* indexes are kept and imported values are unchanged; the database must be writable.
* Expression indexes support NULL-as-empty matching, while plain-column indexes
* support raw-equality lookups. The two forms cannot substitute for one another.
 */
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

	if err := queries.PrepareIndexes(transaction, [][2]string{
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
	if err := queries.PrepareIndexes(transaction, [][2]string{
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
