package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteSortOrderValid(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_sort_order_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_sort_order", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the route_sort_order value

	value, err := db.Routes.Field("route_sort_order")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_sort_order is valid

	if value < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}	