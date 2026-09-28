package trips

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: shape_id
  - Presence: Recommended (internal and external operators)
  - Type: Foreign ID referencing shapes.shape_id

# Description

Identifies the geospatial shape describing the vehicle travel path for a trip, built from the route it serves and the direction it travels in.

The `shape_id` must be the combination of `route_id` and `direction_id`, joined by an underscore, so that the shape of a trip can be derived from the fields that describe it.

Trips without `shape_id`, `route_id` or `direction_id`, and trips whose `direction_id` is neither 0 nor 1, are left alone: there is nothing to compose from, and their own rules already report the problem.

# Example

Both directions of a route reference a shape named after the route and the direction. A `trips.txt` file would contain these records:

	trip_id,route_id,direction_id,shape_id
	1234,1001_0,0,1001_0_0
	1505,1001_0,1,1001_0_1

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func ShapeIdRouteDirectionMatchValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_shape_id_matches_route_id_and_direction_id", row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.ShapeIdRouteDirectionMatch.Severity)
	}
	// 1. Validate shape_id composition is skipped
	if ctx.ShouldSkip() {
		return
	}

	// 2. Validate shape_id and the fields it is composed from are present
	if trip.ShapeId == nil || trip.RouteId == nil || trip.DirectionId == nil {
		return
	}

	// 3. Validate the fields it is composed from carry a usable value
	if *trip.ShapeId == "" || *trip.RouteId == "" || (*trip.DirectionId != 0 && *trip.DirectionId != 1) {
		return
	}

	// 4. Validate shape_id is route_id and direction_id joined by an underscore
	expected := fmt.Sprintf("%s_%d", *trip.RouteId, *trip.DirectionId)
	if *trip.ShapeId != expected {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_id_route_direction_match.not_matching", *trip.ShapeId, expected, *trip.RouteId, *trip.DirectionId))
		return
	}
}
