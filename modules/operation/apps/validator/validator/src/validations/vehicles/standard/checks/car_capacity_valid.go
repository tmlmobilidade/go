package vehicles_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: car_capacity
  - Presence: Optional
  - Type: Non-negative integer

# Description

Number of light vehicles of normal size that the vehicle unit can transport. It is mainly intended for ferries.
When it is equal to 0, it means that the vehicle unit does not allow the boarding of light vehicles.
Required for operators that provide service for light vehicles.
*/
func CarCapacityValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_car_capacity_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("car_capacity", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the car_capacity value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("car_capacity")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty car_capacity values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Convert the car_capacity to an integer

	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the car_capacity is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 7. Return success

	return nil
}
