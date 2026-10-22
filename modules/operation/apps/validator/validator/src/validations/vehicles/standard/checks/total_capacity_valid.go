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
  - Field: total_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Total capacity of passengers. When it is equal to 0, it means that the vehicle unit does not allow the boarding of passengers.
*/
func TotalCapacityValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_total_capacity_non_negative"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("total_capacity", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the total_capacity value

	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("total_capacity")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty total_capacity values

	// Presence belongs to the field check.
	if value == "" {
		return nil
	}

	//
	// 5. Convert the total_capacity to an integer

	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the total_capacity is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 7. Return success

	return nil
}
