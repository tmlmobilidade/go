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
  - Field: drop_off_booking_rule_id
  - Presence: Optional
  - Type: Foreign Key referencing booking_rules.booking_rule_id

# Description

Each supplied drop_off_booking_rule_id must match an ID in booking_rules.txt.
A missing target file or column produces a finding for each supplied ID.
Field-presence rules handle missing or blank source IDs.

[stop_times.txt]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func (StopTimesChecks) StopTimesDropOffBookingRuleIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Report each drop_off_booking_rule_id missing from booking_rules.txt
	var findings []types.Finding
	err := fields.ForEachMissingForeignKey(ctx, db, "stop_times", "drop_off_booking_rule_id", "booking_rules", "booking_rule_id", func(row int, value string) {
		findings = append(findings, types.Finding{
			Description:            "The drop_off_booking_rule_id references a missing booking_rule_id.",
			DescriptionTranslation: types.NewTranslation("missing_reference_value", map[string]any{"field": "drop_off_booking_rule_id", "target_field": "booking_rule_id"}),
			Message:                fmt.Sprintf("Unknown booking_rule_id %q.", value),
			MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "booking_rule_id", "value": value}),
			Severity:               config.Severity,
			FileName:               "stop_times.txt",
			Field:                  "drop_off_booking_rule_id",
			Rows:                   []int{row},
		})
	})

	// 2. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
