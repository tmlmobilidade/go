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
	const ruleID = "trips_direction_id_matches_feed_pattern_direction"
	ctx := lib.NewValidationContext("direction_pattern_id_match", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	values, err := db.Trips.Fields("pattern_id", "direction_id")
	if err != nil {
		return err
	}
	if ctx.ShouldSkip() {
		return nil
	}
	if values["pattern_id"] == "" || values["direction_id"] == "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("required"))
		return nil
	}
	direction, err := strconv.Atoi(values["direction_id"])
	if err != nil {
		return nil
	} // Invalid integers belong to the direction check.
	parts := strings.Split(values["pattern_id"], "_")
	if len(parts) != 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_pattern_id", values["pattern_id"]))
		return nil
	}
	patternDirection, err := strconv.Atoi(parts[1])
	if err != nil || patternDirection < 0 || patternDirection > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_direction_id", parts[1]))
		return nil
	}
	if direction != patternDirection {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_matching", strconv.Itoa(direction), values["pattern_id"]))
	}
	return nil
}
