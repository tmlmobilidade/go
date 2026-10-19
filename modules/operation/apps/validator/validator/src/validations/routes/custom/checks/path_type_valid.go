package routes_custom

import (
	"main/lib"
	"main/services"
	"main/types"
)

func PathTypeValid(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_path_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("path_type", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the path_type value

	value, err := db.Routes.Field("path_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the path_type is valid

	if value != "1" && value != "2" && value != "3" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_valid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}	