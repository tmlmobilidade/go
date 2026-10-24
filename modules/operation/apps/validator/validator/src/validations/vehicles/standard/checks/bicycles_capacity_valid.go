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
  - Field: bicycles_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Number of available spaces for non-folding bicycles. When it is equal to 0, it means that the vehicle unit does not allow the boarding of non-folding bicycles.
*/
func BicyclesCapacityValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_bicycles_capacity_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("bicycles_capacity", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the bicycles_capacity value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("bicycles_capacity")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty bicycles_capacity values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Convert the bicycles_capacity to an integer

	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the bicycles_capacity is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 7. Return success

	return nil
}
