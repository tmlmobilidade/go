package routes_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

func RouteSortOrderValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_sort_order_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_sort_order", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route_sort_order value

	value, err := db.Routes.Field("route_sort_order")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_sort_order is valid

	number, parseErr := strconv.Atoi(value)
	if parseErr != nil || number < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
