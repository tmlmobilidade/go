package routes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LineIdField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_line_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("line_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the line_id value

	value, err := db.Routes.Field("line_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the line_id is required

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
