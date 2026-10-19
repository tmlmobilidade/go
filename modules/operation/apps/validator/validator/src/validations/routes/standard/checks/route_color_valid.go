package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteColorValid(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_color_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_color", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the route_color value

	value, err := db.Routes.Field("route_color")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_color is valid

	if !lib.IsHexString(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_valid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}	