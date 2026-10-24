package vehicles_fields_checks

import (
	"main/lib"
	"main/services"
	"main/types"
)

func CarCapacityField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_car_capacity_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("car_capacity", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the car_capacity value

	value, err := db.Vehicles.Field("car_capacity")
	if err != nil {
		return err
	}

	//
	// 4. Check if the car_capacity is required

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
