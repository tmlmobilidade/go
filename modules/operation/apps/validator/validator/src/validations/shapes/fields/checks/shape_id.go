package shapes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ShapeIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_id", "shapes.txt", ruleID, db.Row, services.AppMessageService)

	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_id value

	value, err := db.Shapes.Field("shape_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_id is required

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
