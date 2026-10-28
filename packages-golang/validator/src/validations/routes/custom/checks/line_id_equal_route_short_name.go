package routes_custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func LineIdEqualRouteShortName(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_line_id_equal_route_short_name"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("line_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the line_id value

	value, err := db.Routes.Field("line_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the line_id is equal to the route_short_name

	routeShortName, err := db.Routes.Field("route_short_name")
	if err != nil {
		return err
	}
	if value != routeShortName {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_equal_to_route_short_name", value, routeShortName))
		return nil
	}

	//
	// 5. Return success

	return nil
}
