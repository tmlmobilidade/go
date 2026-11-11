package rules

import (
	"context"
	"database/sql"
)

// AgencyFilePresent checks the table created when the importer reads agency.txt.
func AgencyFilePresent(ctx context.Context, db *sql.DB) ([]Finding, error) {
	// QueryRowContext runs a query that returns one row and supports cancellation.
	// Scan copies the SQL result into exists; & passes its address for writing.
	var exists bool
	err := db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'agency')").Scan(&exists)
	if err != nil {
		return nil, err
	}

	// Missing GTFS content is a finding, not a database execution error.
	if !exists {
		return []Finding{{
			Severity:    SEVERITY_ERROR,
			Description: "Required agency.txt file must be present.",
			FileName:    "agency.txt",
			Message:     "Required agency.txt file is missing.",
		}}, nil
	}

	// nil findings and nil error mean the rule passed with nothing to report.
	return nil, nil
}
