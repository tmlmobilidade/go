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
	const ruleID = "vehicles_car_capacity_non_negative"
	ctx := lib.NewValidationContext("car_capacity", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	// Read the current SQLite row, rather than a parsed snapshot.
	value, err := db.Vehicles.Field("car_capacity")
	if err != nil {
		return err
	}
	// Presence belongs to the field check.
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}
