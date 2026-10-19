package routes_custom

import (
	"fmt"
	"main/lib"
	"main/services"
	"main/types"
)

func RouteIdFormat(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_id_format"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the values

	routeId, err := db.Routes.Field("route_id")
	if err != nil {
		return err
	}

	routeShortName, err := db.Routes.Field("route_short_name")
	if err != nil {
		return err
	}

	routeSortOrder, err := db.Routes.Field("route_sort_order")
	if err != nil {
		return err
	}

	//
	// 4. Validate route_id is route_short_name and route_sort_order joined by an underscore

	expected := fmt.Sprintf("%s_%d", routeShortName, routeSortOrder)
	if routeId != expected {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", routeId, expected, routeShortName, routeSortOrder))
		return
	}

	//
	// 5. Return success

	return nil
}	