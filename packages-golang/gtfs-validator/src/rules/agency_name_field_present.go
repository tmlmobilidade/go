package rules

import (
	"context"
	"database/sql"
)

// AgencyNameFieldPresent checks SQLite's column metadata. Its prerequisite
// guarantees the agency table exists before this function is scheduled.
func AgencyNameFieldPresent(ctx context.Context, db *sql.DB) ([]Finding, error) {
	var exists bool
	err := db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM pragma_table_info('agency') WHERE name = 'agency_name')").Scan(&exists)
	if err != nil {
		return nil, err
	}

	if !exists {
		return []Finding{{
			Severity: Error,
			FileName: "agency.txt",
			Field:    "agency_name",
			Message:  "Required agency_name field is missing.",
		}}, nil
	}

	return nil, nil
}
