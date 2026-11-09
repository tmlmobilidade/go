package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: stop_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing stops.stop_id

# Description

Identifies the serviced stop or platform in stops.txt, with location_type=0 or empty. A trip can serve the same
stop more than once.

Conditionally Required:
- Required if `stop_times.location_group_id` AND `stop_times.location_id` are NOT defined.
- Forbidden if `stop_times.location_group_id` or `stop_times.location_id` are defined.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func StopTimesStopIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"stop_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the stop_id value

		value, err := queries.Field(row.Source, "stop_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_id is required

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
