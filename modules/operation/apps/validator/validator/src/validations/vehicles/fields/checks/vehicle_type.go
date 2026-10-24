package vehicles_fields_checks

import (
	"main/lib"
	"main/services"
	"main/types"
)

func VehicleTypeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_vehicle_type_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("vehicle_type", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the vehicle_type value

	value, err := db.Vehicles.Field("vehicle_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the vehicle_type is required

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
