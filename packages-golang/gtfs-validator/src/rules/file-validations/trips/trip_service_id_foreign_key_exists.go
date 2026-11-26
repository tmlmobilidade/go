package trips

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/fields"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign Key referencing calendar.service_id or calendar_dates.service_id

# Description

Identifies a service.

Validation: Each supplied service_id must exist in calendar.service_id or
calendar_dates.service_id. Missing values are handled by trip_service_id_exists.

[trips.txt]: https://gtfs.org/schedule/reference/#trips
*/
func (TripsChecks) TripServiceIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the trips table contains service_id
	exists, err := sqlutils.ColumnExists(ctx, db, "trips", "service_id")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Load the service IDs from both referenced tables
	calendarIDs, err := sqlutils.ColumnTextSet(ctx, db, "calendar", "service_id")
	if err != nil {
		return false, nil, err
	}
	calendarDateIDs, err := sqlutils.ColumnTextSet(ctx, db, "calendar_dates", "service_id")
	if err != nil {
		return false, nil, err
	}

	// 3. Report each supplied ID absent from both tables
	var findings []types.Finding
	err = fields.ForEachValue(ctx, db, "trips", "service_id", func(row int, value string) {
		_, inCalendar := calendarIDs[value]
		_, inCalendarDates := calendarDateIDs[value]
		if inCalendar || inCalendarDates {
			return
		}
		findings = append(findings, types.Finding{
			Description:            "The service_id references a missing service_id.",
			DescriptionTranslation: types.NewTranslation("missing_reference_value", map[string]any{"field": "service_id", "target_field": "service_id"}),
			Message:                fmt.Sprintf("Unknown service_id %q.", value),
			MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "service_id", "value": value}),
			Severity:               config.Severity,
			FileName:               "trips.txt",
			Field:                  "service_id",
			Rows:                   []int{row},
		})
	})

	// 4. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
