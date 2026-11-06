package queries

import (
	"database/sql"
	"errors"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
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

	if err := prepareIndexes(transaction, [][2]string{
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
	if err := prepareIndexes(transaction, [][2]string{
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

// prepareIndexes applies one lookup strategy to the available tables and columns.
func prepareIndexes(transaction *sql.Tx, lookups [][2]string, coalesce bool) error {
	//

	//
	// 1. Check tables and columns inside the transaction, without a schema cache

	for _, lookup := range lookups {
		var tableName string
		err := transaction.QueryRow("SELECT name FROM sqlite_schema WHERE type = 'table' AND name = ? COLLATE NOCASE", lookup[0]).Scan(&tableName)
		if errors.Is(err, sql.ErrNoRows) {
			continue
		}
		if err != nil {
			return fmt.Errorf("find SQLite table %q for index preparation: %w", lookup[0], err)
		}
		exists, err := columnExists(transaction, tableName, lookup[1])
		if err != nil {
			return err
		}
		if !exists {
			continue
		}
		prefix := "idx_validation_foreign_"
		expression := dbops.SanitizeName(lookup[1])
		if coalesce {
			prefix = "idx_validation_"
			expression = "COALESCE(" + expression + ", '')"
		}

		//
		// 2. Create the index only when it does not already exist

		name := dbops.SanitizeName(prefix + lookup[0] + "_" + lookup[1])
		query := "CREATE INDEX IF NOT EXISTS " + name + " ON " + dbops.SanitizeName(tableName) + " (" + expression + ")"
		if _, err := transaction.Exec(query); err != nil {
			return fmt.Errorf("prepare lookup index for %s.%s: %w", tableName, lookup[1], err)
		}
	}
	return nil
}
