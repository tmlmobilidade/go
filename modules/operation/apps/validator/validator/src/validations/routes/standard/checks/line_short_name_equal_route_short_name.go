package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func LineShortNameEqualRouteShortName(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_line_short_name_equal_route_short_name"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("line_short_name", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the line_short_name value

	value, err := db.Routes.Field("line_short_name")
	if err != nil {
		return err
	}

	//
	// 4. Check if the line_short_name is equal to the route_short_name

	if value != db.Routes.Field("route_short_name") {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_equal_to_route_short_name", value, db.Routes.Field("route_short_name")))
		return nil
	}

	//
	// 5. Return success

	return nil
}