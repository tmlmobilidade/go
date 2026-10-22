package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
	"sort"
	"strconv"
	"strings"
)

func DirectionIdPatternConsistent(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_direction_id_pattern_consistent"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("direction_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the direction_id is consistent for all patterns in trips

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Get the pattern_id value

	pattern, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}

	//
	// 5. Check if the direction_id is consistent for all patterns in trips

	values := map[string]bool{}
	err = trips_utils.ForGroup(db, "pattern_id", func(row *services.SQLiteRow) error {
		value, err := row.Field("direction_id")
		if err != nil {
			return err
		}
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return nil
		}
		value = strconv.Itoa(parsed)
		if value != "" {
			values[value] = true
		}
		return nil
	})

	if err != nil {
		return err
	}

	//
	// 6. Check if the direction_id is consistent for all patterns in trips

	if len(values) > 1 {
		keys := make([]string, 0, len(values))
		for value := range values {
			keys = append(keys, value)
		}
		sort.Slice(keys, func(i, j int) bool { a, _ := strconv.Atoi(keys[i]); b, _ := strconv.Atoi(keys[j]); return a < b })
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_direction_ids_in_pattern", pattern, strings.Join(keys, ", ")))
	}

	//
	// 7. Return success

	return nil
}
