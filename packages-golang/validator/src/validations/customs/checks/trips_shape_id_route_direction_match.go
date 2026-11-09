package custom

import (
	"fmt"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [shape_id, route_id, direction_id]
  - Presence: Conditionally Required, Required, Optional
  - Type: Foreign ID referencing shapes.shape_id, Foreign ID referencing routes.route_id, Enum

# Description

Builds the expected shape identifier from the route and trip direction.

Validation: Skips trips with an empty shape_id or route_id, or a direction that does not parse as 0 or 1. Otherwise
requires shape_id to equal route_id, one underscore and the normalized integer direction. The route and shape text
are not trimmed. This rule does not resolve the shape reference.

Example: route_id=1001_1 and direction_id=0 require shape_id=1001_1_0.

The comparison is skipped when this rule is configured as forbidden. Unavailable source or lookup tables skip the
check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
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
