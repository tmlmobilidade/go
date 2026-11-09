package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: start_time
  - Presence: Required
  - Type: Time

# Description

Departure time of the first vehicle from the trip's first stop for this headway interval.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func StartTimeField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "frequencies", []string{"start_time"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the start_time value

		value, err := queries.Field(row.Source, "start_time")
		if err != nil {
			return err
		}

		//
		// 3. Check if the start_time is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
