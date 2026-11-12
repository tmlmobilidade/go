package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: exact_times
  - Presence: Optional
  - Type: Enum

# Description

Specifies frequency-based service with 0 or an empty value, or exact scheduled departures at a fixed headway with
1. For exact service, end_time is after the last departure and before that departure plus headway_secs.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func ExactTimesField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "frequencies", []string{"exact_times"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the exact_times value

		value, err := queries.Field(row.Source, "exact_times")
		if err != nil {
			return err
		}

		//
		// 3. Check if the exact_times is required

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
