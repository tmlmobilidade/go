package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: headway_secs
  - Presence: Required
  - Type: Positive integer

# Description

Positive interval in seconds between departures during the period from start_time to end_time. Intervals for the
same trip must not overlap, but consecutive intervals may share an endpoint.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func HeadwaySecsField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "frequencies", []string{"headway_secs"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the headway_secs value

		value, err := queries.Field(row.Source, "headway_secs")
		if err != nil {
			return err
		}

		//
		// 3. Check if the headway_secs is required

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
