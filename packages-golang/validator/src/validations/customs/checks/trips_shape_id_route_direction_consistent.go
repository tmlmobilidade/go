package custom

import (
	"sort"
	"strconv"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [route_id, direction_id, shape_id]
  - Presence: Required, Optional, Conditionally Required
  - Type: Foreign ID referencing routes.route_id, Enum, Foreign ID referencing shapes.shape_id

# Description

Keeps a single populated shape_id for each route and direction combination.

Validation: Groups trips by non-empty route_id and separates parsed direction_id values 0 and 1. Trips with an
empty shape_id or an unreadable or out-of-domain direction are ignored. More than one distinct string in either
combination produces a finding at that combination's first populated member. Numeric direction spelling is
normalized; shape_id text is not.

Rows with an empty route_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func ShapeIdRouteDirectionConsistent(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "route_id", []string{"shape_id", "route_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		//
		// 2. Check if the shape_id validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the route_id value

		route, err := queries.Field(rowCtx.Source, "route_id")
		if err != nil {
			return err
		}
		values := map[int]map[string]bool{}
		firstRows := map[int]int{}

		//
		// 4. Collect shape_id values for the route_id group

		err = validationutils.ForGroupFields(rowCtx, "route_id", []string{"shape_id", "direction_id"}, func(row *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["shape_id"]
			if value == "" {
				return nil
			}
			direction, err := strconv.Atoi(fields["direction_id"])
			if err != nil || direction < 0 || direction > 1 {
				return nil
			}
			if values[direction] == nil {
				values[direction] = map[string]bool{}
				firstRows[direction] = row.Row
			}
			values[direction][value] = true
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 5. Check the shape_id values for each direction

		for direction := 0; direction <= 1; direction++ {
			if len(values[direction]) <= 1 {
				continue
			}

			keys := make([]string, 0, len(values[direction]))
			for value := range values[direction] {
				keys = append(keys, value)
			}
			sort.Strings(keys)
			validationutils.AddMessageAt(rowCtx, "shape_id", firstRows[direction], context.GetTranslatedMessage(rowCtx, "inconsistent_direction", route, direction, "shape_id", strings.Join(keys, ", ")))
		}

		//
		// 6. Return success

		return nil
	})
}
