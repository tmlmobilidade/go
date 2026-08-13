package stop_times

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: shape_dist_traveled
  - Presence: Optional
  - Type: Non-negative Float

# Description

Actual distance traveled along the associated shape, from the first stop to the stop specified in this record.

This field specifies how much of the shape to draw between any two stops during a trip.

Must be in the same units used in [shapes.txt].

Values used for shape_dist_traveled must increase along with stop_sequence; they must not be used to show reverse travel along a route.

Recommended for routes that have looping or inlining (the vehicle crosses or travels over the same portion of alignment in one trip).

See shapes.shape_dist_traveled.

# Example

If a bus travels a distance of 5.25 kilometers from the start of the shape to the stop,shape_dist_traveled=5.25.

[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
[shapes.txt]: https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapeDistTraveledValidation(stopTime *types.StopTime, row int, rules *types.StopTimesRules) {
	ctx := lib.NewValidationContext("shape_dist_traveled", "stop_times.txt", "stop_times_shape_dist_traveled_non_decreasing_on_trip", row, services.AppMessageService)
	if rules != nil && rules.ShapeDistTraveled.Severity != "" {
		ctx.WithSeverity(rules.ShapeDistTraveled.Severity)
	}

	if stopTime.ShapeDistTraveled == nil {
		if ctx.ShouldSkip() {
			return
		}
		message := ctx.GetRequiredMessage("shape_dist_traveled_validation.required", "shape_dist_traveled_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_dist_traveled_validation.forbidden"))
		return
	}

	if *stopTime.ShapeDistTraveled < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("shape_dist_traveled_validation.negative"))
		return
	}
}
