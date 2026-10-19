package shapes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ShapePtLatValid(db *services.SQLiteContext, rules *types.ShapesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_pt_lat_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_pt_lat", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the shape_pt_lat value

	value, err := db.Shapes.Field("shape_pt_lat")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_pt_lat is valid

	if !lib.ValidateLatitude(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}	