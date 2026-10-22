package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
	"strings"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: direction_id
  - Presence: Required
  - Type: ID

# Description

Ensure the direction_id is consistent with the pattern_id (e.g., pattern_id "1001_0_1" should have direction_id = 0).
*/
func DirectionPatternIdMatch(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_direction_pattern_id_match"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("direction_pattern_id_match", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pattern_id, direction_id values

	values, err := db.Trips.Fields("pattern_id", "direction_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the direction_pattern_id_match validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 5. Skip empty direction_pattern_id_match values

	if values["pattern_id"] == "" || values["direction_id"] == "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("required"))
		return nil
	}

	//
	// 6. Convert the direction_id to an integer

	direction, err := strconv.Atoi(values["direction_id"])
	if err != nil {
		return nil
	} // Invalid integers belong to the direction check.

	//
	// 7. Split the pattern_id into its components

	parts := strings.Split(values["pattern_id"], "_")

	//
	// 8. Check if the direction_pattern_id_match is valid pattern id

	if len(parts) != 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_pattern_id", values["pattern_id"]))
		return nil
	}

	//
	// 9. Convert the direction_pattern_id_match to an integer

	patternDirection, err := strconv.Atoi(parts[1])

	//
	// 10. Check if the direction_pattern_id_match is valid direction id

	if err != nil || patternDirection < 0 || patternDirection > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_direction_id", parts[1]))
		return nil
	}

	//
	// 11. Check if direction_id matches the direction encoded in pattern_id

	if direction != patternDirection {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_matching", strconv.Itoa(direction), values["pattern_id"]))
	}

	//
	// 12. Return success

	return nil
}
