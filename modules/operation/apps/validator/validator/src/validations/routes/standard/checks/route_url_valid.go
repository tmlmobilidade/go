package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteUrlValid(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_url_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_url", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the route_url value

	value, err := db.Routes.Field("route_url")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}	