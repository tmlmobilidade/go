package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
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
func PatternIdSameShapeId(db *sqlite.SQLiteContext, ruleContext *rules.RuleContext, messageAdder messages.MessageAdder) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_pattern_id_same_shape_id"

	//
	// 2. Create the validation context

	ctx := context.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, messageAdder)

	//
	// 3. Get the pattern_id, shape_id values

	values, err := queries.Fields(db.Trips, "pattern_id", "shape_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the pattern_id validation should run

	if values["pattern_id"] == "" || values["shape_id"] == "" || context.ShouldSkip(ctx) {
		return nil
	}

	//
	// 5. Check if pattern_id matches the shape_id

	if values["pattern_id"] != values["shape_id"] {
		context.AddMessageWithSeverity(ctx, context.GetTranslatedMessage(ctx, "not_matching", values["pattern_id"], values["shape_id"]))
	}

	//
	// 6. Return success

	return nil
}
