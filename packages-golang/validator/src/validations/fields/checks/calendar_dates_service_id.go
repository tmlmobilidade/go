package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: service_id
  - Presence: Required
  - Type: Foreign ID referencing calendar.service_id or ID

# Description

Identifies the service affected by the exception. When calendar.txt defines the same service_id, this record
modifies that calendar. A service_id and date pair must not be repeated.

Presence and type follow [GTFS Standard].

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendar_datestxt
*/
func CalendarDatesServiceIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar_dates", []string{"service_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get service_id and its occurrence count in calendar_dates

		value, err := queries.Field(row.Source, "service_id")
		if err != nil {
			return err
		}

		//
		// 3. Validate service_id is present

		if value == "" {
			if context.ShouldSkip(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
