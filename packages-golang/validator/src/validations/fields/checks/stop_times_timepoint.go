package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: timepoint
  - Presence: Optional
  - Type: Enum

# Description

Indicates whether arrival and departure times are approximate with 0 or exact with 1. When timepoint is not
provided, times are treated as exact.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func TimepointField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"timepoint"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the timepoint value

		value, err := queries.Field(row.Source, "timepoint")
		if err != nil {
			return err
		}

		//
		// 3. Check if the timepoint is required

		if value == "" {
			if context.ShouldIgnore(row) {
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
