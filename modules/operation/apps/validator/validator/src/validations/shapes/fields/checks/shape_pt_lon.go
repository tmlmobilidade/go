package shapes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ShapePtLonField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_pt_lon_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_pt_lon", "shapes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_pt_lon value

	value, err := db.Shapes.Field("shape_pt_lon")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_pt_lon is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
