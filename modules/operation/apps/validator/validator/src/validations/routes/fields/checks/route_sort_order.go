package routes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteSortOrderField(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_sort_order_field"

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
	// 4. Check if the route_sort_order is required

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
