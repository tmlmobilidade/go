package shapes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

func ShapePtSequence(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_pt_sequence_non_negative"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_pt_sequence value

	value, err := db.Shapes.Field("shape_pt_sequence")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_pt_sequence is non-negative

	number, parseErr := strconv.Atoi(value)
	if parseErr != nil || number < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
