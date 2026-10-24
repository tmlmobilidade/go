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
	//

	//
	// 1. Get the rule

	const ruleID = "trips_pattern_id_same_shape_id"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pattern_id, shape_id values

	values, err := db.Trips.Fields("pattern_id", "shape_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the pattern_id validation should run

	if values["pattern_id"] == "" || values["shape_id"] == "" || ctx.ShouldSkip() {
		return nil
	}

	//
	// 5. Check if pattern_id matches the shape_id

	if values["pattern_id"] != values["shape_id"] {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_matching", values["pattern_id"], values["shape_id"]))
	}

	//
	// 6. Return success

	return nil
}
