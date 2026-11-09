package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: service_id
  - Presence: Required
  - Type: Unique ID

# Description

Identifies a set of dates on which one or more routes operate.

Presence and type follow [GTFS Standard].

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendartxt
*/
func ServiceIdValidation(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar", []string{"service_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get service_id and its occurrence count in calendar

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
