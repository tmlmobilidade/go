package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func NetworkIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_network_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("network_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the network_id value

	value, err := db.Routes.Field("network_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the network_id is foreign

	if !db.RouteNetworks.Exists("network_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
