package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: monday
  - Presence: Required
  - Type: Enum

# Description

Indicates whether service operates on Mondays between start_date and end_date. Use 1 for service and 0 for no
service; calendar_dates.txt may override individual dates.

Presence and type follow [GTFS Standard].

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendartxt
*/
func MondayValidation(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "calendar", []string{"monday"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the value

		value, err := queries.Field(row.Source, "monday")
		if err != nil {
			return err
		}

		//
		// 3. Validate value is present

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
