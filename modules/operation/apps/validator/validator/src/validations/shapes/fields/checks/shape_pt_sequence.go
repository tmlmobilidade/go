package shapes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ShapePtSequenceField(db *services.SQLiteContext, rules *types.ShapesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_pt_sequence_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the shape_pt_sequence value

	value, err := db.Shapes.Field("shape_pt_sequence")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_pt_sequence is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}	