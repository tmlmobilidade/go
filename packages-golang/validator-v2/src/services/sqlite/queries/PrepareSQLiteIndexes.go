package queries

import (
	"database/sql"
	"fmt"

	dbops "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/database"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
)

// PrepareSQLiteIndexes creates validation lookup indexes before concurrent checks start.
// Missing tables or columns are left for GTFS rules to report. Imported values are unchanged.
func PrepareSQLiteIndexes(tables *types.SQLiteTables) error {
	//

	//
	// 1. Require loaded table metadata and its database connection

	if tables == nil || tables.DB == nil {
		return fmt.Errorf("SQLite tables must be loaded before preparing indexes")
	}

	//
	// 2. Create all indexes in one transaction so a failure leaves no partial setup

	transaction, err := tables.DB.Begin()
	if err != nil {
		return fmt.Errorf("begin SQLite index preparation: %w", err)
	}
	defer transaction.Rollback()

	//
	// 3. Index NULL-as-empty lookups used by matching-row and grouping queries

	if err := prepareIndexes(transaction, tables, [][2]string{
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
	if err := prepareIndexes(transaction, tables, [][2]string{
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
func prepareIndexes(transaction *sql.Tx, tables *types.SQLiteTables, lookups [][2]string, coalesce bool) error {
	//

	//
	// 1. Skip unavailable columns and keep both index naming schemes stable

	for _, lookup := range lookups {
		table := tables.Tables[lookup[0]]
		if table == nil || !table.Columns[lookup[1]] {
			continue
		}
		if table.DB != tables.DB {
			return fmt.Errorf("SQLite table %q belongs to a different database", table.Name)
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
		query := "CREATE INDEX IF NOT EXISTS " + name + " ON " + dbops.SanitizeName(table.Name) + " (" + expression + ")"
		if _, err := transaction.Exec(query); err != nil {
			return fmt.Errorf("prepare lookup index for %s.%s: %w", table.Name, lookup[1], err)
		}
	}
	return nil
}
