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
  - File: [trips.txt]
  - Field: route_id
  - Presence: Optional
  - Type: ID

# Description

Validates if route_id is unique within each pattern_id.
All trips with the same pattern_id must have the same route_id.
If a pattern_id has trips with different route_ids, report error.
*/
func RouteIdPatternConsistent(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_route_id_pattern_consistent"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the route_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the pattern_id value

	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}
	values := map[string]bool{}

	//
	// 5. Collect route_id values for the pattern_id group

	err = trips_utils.ForGroupFields(db, "pattern_id", []string{"route_id"}, func(_ *services.SQLiteRow, fields map[string]string) error {
		value := fields["route_id"]
		if value != "" {
			values[value] = true
		}
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 6. Check if the route_id values are consistent within the group

	if len(values) > 1 {
		keys := make([]string, 0, len(values))
		for value := range values {
			keys = append(keys, value)
		}
		sort.Strings(keys)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_route_ids_in_pattern", pattern, strings.Join(keys, ", ")))
	}

	//
	// 7. Return success

	return nil
}
