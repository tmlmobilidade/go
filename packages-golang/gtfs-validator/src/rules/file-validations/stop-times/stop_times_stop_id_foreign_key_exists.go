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
  - Field: stop_id
  - Presence: Conditionally Required
  - Type: Foreign Key referencing stops.stop_id

# Description

Each supplied stop_id must match an ID in stops.txt. A missing target file or
column produces a finding for each supplied ID. Field-presence rules handle
missing or blank source IDs.

[stop_times.txt]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func (StopTimesChecks) StopTimesStopIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Report each stop_id missing from stops.txt
	var findings []types.Finding
	descriptionTranslation := types.NewTranslation("missing_reference_value", map[string]any{"field": "stop_id", "target_field": "stop_id"})
	err := fields.ForEachMissingForeignKey(ctx, db, "stop_times", "stop_id", "stops", "stop_id", func(row int, value string) {
		findings = append(findings, types.Finding{
			Description:            "The stop_id references a missing stop_id.",
			DescriptionTranslation: descriptionTranslation,
			Message:                fmt.Sprintf("Unknown stop_id %q.", value),
			MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "stop_id", "value": value}),
			Severity:               config.Severity,
			FileName:               "stop_times.txt",
			Field:                  "stop_id",
			Rows:                   []int{row},
		})
	})

	// 2. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
