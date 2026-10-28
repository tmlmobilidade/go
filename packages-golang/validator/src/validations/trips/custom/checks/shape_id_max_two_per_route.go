package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
	"sort"
	"strings"
)

/*
# Attributes
  - File: trips.txt
  - Field: shape_id

# Description

Each route_id may have at most two distinct shape_id values.
Trips with the same route_id and direction_id must share one shape_id.
Missing values and invalid directions are handled by their own rules.
*/
func ShapeIdMaxTwoPerRoute(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_shape_id_max_two_per_route"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the shape_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the route_id value

	route, err := db.Trips.Field("route_id")
	if err != nil {
		return err
	}
	values := map[int]map[string]bool{}
	firstRows := map[int]int{}

	//
	// 5. Collect shape_id values for the route_id group

	err = trips_utils.ForGroupFields(db, "route_id", []string{"shape_id"}, func(row *services.SQLiteRow, fields map[string]string) error {
		value := fields["shape_id"]
		if value == "" {
			return nil
		}
		direction := 0
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
	// 6. Check the shape_id values for each direction

	for direction := 0; direction <= 1; direction++ {
		if len(values[direction]) <= 2 {
			continue
		}
		groupCtx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, firstRows[direction], services.AppMessageService)
		if rules != nil {
			groupCtx.WithSeverity(rules.Severity)
		}
		keys := make([]string, 0, len(values[direction]))
		for value := range values[direction] {
			keys = append(keys, value)
		}
		sort.Strings(keys)
		groupCtx.AddMessageWithSeverity(groupCtx.GetTranslatedMessage("max_two", route, "shape_id", len(keys), strings.Join(keys, ", ")))
	}

	//
	// 7. Return success

	return nil
}
