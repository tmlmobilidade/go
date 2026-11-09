package rules

import (
	"context"
	"database/sql"
	"fmt"
)

// AgencyNameValid runs only after the table and required column checks pass.
func AgencyNameValid(ctx context.Context, db *sql.DB) ([]Finding, error) {
	// The importer stores empty fields as NULL. Also reject names made entirely
	// of ASCII whitespace: char(9)..char(13) are tab/newline characters and ||
	// concatenates them with the space character for SQLite's trim function.
	var count int
	err := db.QueryRowContext(ctx, "SELECT COUNT(*) FROM agency WHERE agency_name IS NULL OR trim(agency_name, char(9) || char(10) || char(11) || char(12) || char(13) || ' ') = ''").Scan(&count)
	if err != nil {
		return nil, err
	}

	// Return one aggregate finding, since original CSV row numbers are unavailable.
	if count > 0 {
		return []Finding{{
			Severity: Error,
			FileName: "agency.txt",
			Field:    "agency_name",
			Message:  fmt.Sprintf("%d agency rows have an empty agency_name.", count),
		}}, nil
	}

	return nil, nil
}
