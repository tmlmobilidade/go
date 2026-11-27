package stoptimes

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Foreign Key referencing trips.trip_id

# Description

Each supplied trip_id must match an ID in trips.txt. A missing target file or
column produces a finding for each supplied ID. Field-presence rules handle
missing or blank source IDs.

[stop_times.txt]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func (StopTimesChecks) StopTimesTripIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Report each trip_id missing from trips.txt
	var findings []types.Finding
	descriptionTranslation := types.NewTranslation("missing_reference_value", map[string]any{"field": "trip_id", "target_field": "trip_id"})
	err := fields.ForEachMissingForeignKey(ctx, db, "stop_times", "trip_id", "trips", "trip_id", func(row int, value string) {
		findings = append(findings, types.Finding{
			Description:            "The trip_id references a missing trip_id.",
			DescriptionTranslation: descriptionTranslation,
			Message:                fmt.Sprintf("Unknown trip_id %q.", value),
			MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "trip_id", "value": value}),
			Severity:               config.Severity,
			FileName:               "stop_times.txt",
			Field:                  "trip_id",
			Rows:                   []int{row},
		})
	})

	// 2. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
