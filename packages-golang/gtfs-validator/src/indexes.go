package gtfsvalidator

import (
	"context"
	"database/sql"
	"fmt"
)

func createValidationIndexes(ctx context.Context, database *sql.DB) error {
	tx, err := database.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin validation index setup: %w", err)
	}
	defer tx.Rollback()

	for _, index := range []struct {
		table    string
		column   string
		second   string
		coalesce bool
	}{
		// Keep the composite column order in sync with import-gtfs/src/tables.ts.
		{table: "shapes", column: "shape_id", second: "shape_pt_sequence"},
		{table: "stop_times", column: "trip_id", second: "stop_sequence"},
		{table: "trips", column: "shape_id", second: "trip_id"},
		// Matching and grouping queries treat NULL as an empty string.
		{table: "stop_times", column: "trip_id", coalesce: true},
		{table: "stops", column: "stop_id", coalesce: true},
		{table: "shapes", column: "shape_id", coalesce: true},
		{table: "trips", column: "trip_id", coalesce: true},
		{table: "trips", column: "route_id", coalesce: true},
		{table: "trips", column: "pattern_id", coalesce: true},
		{table: "trips", column: "shape_id", coalesce: true},
		// Foreign-reference checks use raw equality.
		{table: "agency", column: "agency_id"},
		{table: "calendar", column: "service_id"},
		{table: "calendar_dates", column: "service_id"},
		{table: "fare_attributes", column: "fare_id"},
		{table: "routes", column: "route_id"},
		{table: "shapes", column: "shape_id"},
		{table: "stop_times", column: "stop_id"},
		{table: "stop_times", column: "location_id"},
		{table: "stops", column: "stop_id"},
		{table: "stops", column: "zone_id"},
		{table: "stops", column: "parent_station"},
		{table: "trips", column: "trip_id"},
	} {
		name := fmt.Sprintf("idx_%s_%s", index.table, index.column)
		keys := index.column
		wantColumns := 1
		if index.second != "" {
			name += "_" + index.second
			keys += ", " + index.second
			wantColumns = 2
		}
		if index.coalesce {
			name += "_coalesce"
			keys = fmt.Sprintf("COALESCE(%s, '')", index.column)
		}

		// A feed with missing files or headers must still reach validation.
		var count int
		err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM pragma_table_info(?) WHERE name IN (?, NULLIF(?, ''))`,
			index.table, index.column, index.second).Scan(&count)
		if err != nil {
			return fmt.Errorf("check index columns for %s: %w", index.table, err)
		}
		if count != wantColumns {
			continue
		}

		statement := fmt.Sprintf("CREATE INDEX IF NOT EXISTS %s ON %s (%s)", name, index.table, keys)
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("create index %s: %w", name, err)
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit validation index setup: %w", err)
	}
	return nil
}
