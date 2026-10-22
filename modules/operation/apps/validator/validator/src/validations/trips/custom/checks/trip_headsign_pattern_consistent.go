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
  - Field: trip_headsign
  - Presence: Required
  - Type: Text

# Description

 1. All trips with the same pattern_id must have the same trip_headsign
    (including consistent presence: nil/empty vs non-empty).
*/
func TripHeadsignPatternConsistent(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trip_headsign_consistent_for_all_patterns_in_trips"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("trip_headsign", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the trip_headsign validation should run

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
	// 5. Collect trip_headsign values for the pattern_id group

	err = trips_utils.ForGroup(db, "pattern_id", func(row *services.SQLiteRow) error {
		value, err := row.Field("trip_headsign")
		if err != nil {
			return err
		}
		values[value] = true
		return nil
	})
	if err != nil {
		return err
	}

	//
	// 6. Check if the trip_headsign values are consistent within the group

	if len(values) > 1 {
		keys := make([]string, 0, len(values))
		for value := range values {
			keys = append(keys, value)
		}
		sort.Strings(keys)
		for i, value := range keys {
			if value == "" {
				keys[i] = "[empty]"
			}
		}
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_headsigns_in_pattern", pattern, strings.Join(keys, ", ")))
	}

	//
	// 7. Return success

	return nil
}
