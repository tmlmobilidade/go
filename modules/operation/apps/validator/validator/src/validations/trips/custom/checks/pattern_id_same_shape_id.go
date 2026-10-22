package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: pattern_id
  - Presence: Recommended
  - Type: ID

# Description

The `pattern_id` must be the same as the `shape_id`, so that the pattern identifier matches the shape referenced by the trip.

Trips without `shape_id` or `pattern_id` are left alone: there is nothing to compare, and their own rules already report the problem.
*/
func PatternIdSameShapeId(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trips_pattern_id_needs_to_be_the_same_as_shape_id"
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	values, err := db.Trips.Fields("pattern_id", "shape_id")
	if err != nil {
		return err
	}
	if values["pattern_id"] == "" || values["shape_id"] == "" || ctx.ShouldSkip() {
		return nil
	}
	if values["pattern_id"] != values["shape_id"] {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_matching", values["pattern_id"], values["shape_id"]))
	}
	return nil
}
