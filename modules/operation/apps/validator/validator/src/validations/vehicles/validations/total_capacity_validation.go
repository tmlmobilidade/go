package vehicles

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

func TotalCapacityValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("total_capacity", "vehicles.txt", "vehicles_total_capacity_non_negative", row, services.AppMessageService)
	if rules != nil && rules.TotalCapacity.Severity != "" {
		ctx.WithSeverity(rules.TotalCapacity.Severity)
	}

	// 1. Check if total_capacity is required
	if vehicle.TotalCapacity == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("total_capacity_validation.required", "total_capacity_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if total_capacity is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("total_capacity_validation.forbidden"))
		return
	}

	// 3. Check if total_capacity is valid
	if *vehicle.TotalCapacity < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("total_capacity_validation.invalid", strconv.Itoa(*vehicle.TotalCapacity)))
		return
	}
}
