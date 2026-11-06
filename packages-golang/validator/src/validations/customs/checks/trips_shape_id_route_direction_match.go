package custom

import (
	"fmt"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
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
func ShapeIdRouteDirectionMatch(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"shape_id", "route_id", "direction_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Get the shape_id, route_id, direction_id values

		values, err := queries.Fields(rowCtx.Source, "shape_id", "route_id", "direction_id")
		if err != nil {
			return err
		}

		//
		// 3. Convert the direction_id to an integer

		direction, err := strconv.Atoi(values["direction_id"])

		//
		// 4. Check if the shape_id validation should run

		if values["shape_id"] == "" || values["route_id"] == "" || err != nil || direction < 0 || direction > 1 || context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 5. Build the expected shape_id value

		expected := fmt.Sprintf("%s_%d", values["route_id"], direction)

		//
		// 6. Check if the shape_id matches the route and direction

		if values["shape_id"] != expected {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_matching", values["shape_id"], expected, values["route_id"], direction))
		}

		//
		// 7. Return success

		return nil
	})
}
