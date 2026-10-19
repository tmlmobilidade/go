package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteTypeValid(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_type", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the route_type value

	value, err := db.Routes.Field("route_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_type is valid

	if value != "1" && value != "2" && value != "3" && value != "4" && value != "5" && value != "6" && value != "7" && value != "11" && value != "12" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}	