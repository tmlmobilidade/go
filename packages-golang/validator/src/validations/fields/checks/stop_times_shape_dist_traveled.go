package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: shape_dist_traveled
  - Presence: Optional
  - Type: Non-negative float

# Description

Distance along the associated shape to this stop. It must increase with stop_sequence and use the same units as
shapes.shape_dist_traveled, including for loops or repeated alignment segments.

Presence and type follow [GTFS Standard].

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stop_timestxt
*/
func StopTimesShapeDistTraveledField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "stop_times", []string{"shape_dist_traveled"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the shape_dist_traveled value

		value, err := queries.Field(row.Source, "shape_dist_traveled")
		if err != nil {
			return err
		}

		//
		// 3. Check if the shape_dist_traveled is required

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
