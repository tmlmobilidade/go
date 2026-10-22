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
	const ruleID = "trips_route_id_consistent_for_all_patterns_in_trips"
	ctx := lib.NewValidationContext("route_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}
	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}
	values := map[string]bool{}
	err = trips_utils.ForGroup(db, "pattern_id", func(row *services.SQLiteRow) error {
		value, err := row.Field("route_id")
		if err != nil {
			return err
		}
		if value != "" {
			values[value] = true
		}
		return nil
	})
	if err != nil {
		return err
	}
	if len(values) > 1 {
		keys := make([]string, 0, len(values))
		for value := range values {
			keys = append(keys, value)
		}
		sort.Strings(keys)
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_route_ids_in_pattern", pattern, strings.Join(keys, ", ")))
	}
	return nil
}
