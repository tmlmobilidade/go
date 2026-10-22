package trips_custom

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: shape_id
  - Presence: Recommended
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
func ShapeIdRouteDirectionMatch(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_shape_id_matches_route_id_and_direction_id"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_id, route_id, direction_id values

	values, err := db.Trips.Fields("shape_id", "route_id", "direction_id")
	if err != nil {
		return err
	}

	//
	// 4. Convert the direction_id to an integer

	direction, err := strconv.Atoi(values["direction_id"])

	//
	// 5. Check if the shape_id validation should run

	if values["shape_id"] == "" || values["route_id"] == "" || err != nil || direction < 0 || direction > 1 || ctx.ShouldSkip() {
		return nil
	}

	//
	// 6. Build the expected shape_id value

	expected := fmt.Sprintf("%s_%d", values["route_id"], direction)

	//
	// 7. Check if the shape_id matches the route and direction

	if values["shape_id"] != expected {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_matching", values["shape_id"], expected, values["route_id"], direction))
	}

	//
	// 8. Return success

	return nil
}
