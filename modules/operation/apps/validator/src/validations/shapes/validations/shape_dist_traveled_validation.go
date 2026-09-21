package shapes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Optional
  - Type: Non-negative float

# Description

Actual distance traveled along the shape from the first shape point to the point specified in this record.

Used by trip planners to show the correct portion of the shape on a map.

Values must increase along with `shape_pt_sequence`; they must not be used to show reverse travel along a route.

Distance units must be consistent with those used in [stop_times.txt].

Recommended for routes that have looping or inlining (the vehicle crosses or travels over the same portion of alignment in one trip).

If a vehicle retraces or crosses the route alignment at points in the course of a trip, `shape_dist_traveled` is important to clarify how portions of the points in [shapes.txt] line up correspond with records in [stop_times.txt].

# Example

If a bus travels along the three points defined above for A_shp, the additional `shape_dist_traveled` values (shown here in kilometers) would look like this:

	shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled
	A_shp,37.61956,-122.48161,0,0
	A_shp,37.64430,-122.41070,6,6.8310
	A_shp,37.65863,-122.30839,11,15.8765

[shapes.txt]: https://gtfs.org/schedule/reference/#shapestxt
[stop_times.txt]: https://gtfs.org/schedule/reference/#stoptimetxt
*/
func ShapeDistTraveledValidation(shape *types.Shape, row int, rules *types.ShapesRules) {
	ctx := lib.NewValidationContext("shape_dist_traveled", "shapes.txt", "shape_dist_traveled_non_negative_monotonic", row, services.AppMessageService)
	if rules != nil && rules.ShapeDistTraveled.Severity != "" {
		ctx.WithSeverity(rules.ShapeDistTraveled.Severity)
	}

	if shape.ShapeDistTraveled == nil {
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

	// Validate shape_dist_traveled
	if *shape.ShapeDistTraveled < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("shape_dist_traveled_validation.invalid"))
		return
	}
}
