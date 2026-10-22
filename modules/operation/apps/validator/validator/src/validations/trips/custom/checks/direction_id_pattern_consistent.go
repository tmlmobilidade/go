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

/*
# Attributes
  - File: [trips.txt]
  - Field: direction_id
  - Presence: Optional
  - Type: Enum

# Description

Validates if direction_id is unique within each pattern_id.
All trips with the same pattern_id must have the same direction_id.
If a pattern_id has trips with different direction_ids, report error.
*/
func DirectionIdPatternConsistent(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_direction_id_consistent_for_all_patterns_in_trips"
	ctx := lib.NewValidationContext("direction_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
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
	if len(values) > 1 {
		keys := make([]string, 0, len(values))
		for value := range values {
			keys = append(keys, value)
		}
		sort.Slice(keys, func(i, j int) bool { a, _ := strconv.Atoi(keys[i]); b, _ := strconv.Atoi(keys[j]); return a < b })
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("different_direction_ids_in_pattern", pattern, strings.Join(keys, ", ")))
	}
	return nil
}
