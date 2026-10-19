package shapes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
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
	// 4. Transform the value to a float

	number, parseErr := strconv.ParseFloat(value, 64)
	if parseErr != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Check if the shape_pt_lat is valid

	if !lib.ValidateLatitude(number) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Return success

	return nil
}	