package routes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func NetworkIdField(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_network_id_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("network_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the network_id value

	value, err := db.Routes.Field("network_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the network_id is required

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