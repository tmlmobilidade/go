package routes_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ContinuousPickupField(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_continuous_pickup_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("continuous_pickup", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the continuous_pickup value

	value, err := db.Routes.Field("continuous_pickup")
	if err != nil {
		return err
	}

	//
	// 4. Check if the continuous_pickup is required

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