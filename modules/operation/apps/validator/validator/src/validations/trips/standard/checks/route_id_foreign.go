package trips_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_route_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the route_id value

	value, err := db.Trips.Field("route_id")
	if err != nil {
		return err
	}

	//
	// 4. Requiredness is checked by the field rule.

	if value == "" {
		return nil
	}

	//
	// 5. Check if the route_id exists in the routes table

	if !db.Routes.Exists("route_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	//
	// 6. Return success

	return nil
}
