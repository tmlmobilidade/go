package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ShapeIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_shape_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_id value

	value, err := db.Trips.Field("shape_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_id exists in the shapes table

	if !db.Shapes.Exists("shape_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	//
	// 5. Return success

	return nil
}
