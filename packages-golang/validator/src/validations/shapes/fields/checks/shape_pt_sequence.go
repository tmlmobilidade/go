package shapes_fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func ShapePtSequenceField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "shapes_shape_pt_sequence_field"

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
	// 4. Check if the shape_pt_sequence is required

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
