package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route_id value

	value, count, err := db.Routes.FieldWithCount("route_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
