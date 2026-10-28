package trips_custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	trips_utils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/trips/utils"
	"main/types"
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

	const ruleID = "trips_trip_headsign_pattern_consistent"

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

	err = trips_utils.ForGroupFields(db, "pattern_id", []string{"trip_headsign"}, func(_ *services.SQLiteRow, fields map[string]string) error {
		value := fields["trip_headsign"]
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
