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
  - Field: bicycles_capacity
  - Presence: Required
  - Type: Non-negative integer

# Description

Number of available spaces for non-folding bicycles. When it is equal to 0, it means that the vehicle unit does not allow the boarding of non-folding bicycles.
*/

func BicyclesCapacityValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("bicycles_capacity", "vehicles.txt", "vehicles_bicycles_rack_count_non_negative", row, services.AppMessageService)
	if rules != nil && rules.BicyclesCapacity.Severity != "" {
		ctx.WithSeverity(rules.BicyclesCapacity.Severity)
	}

	// 1. Check if bicycles_capacity is required
	if vehicle.BicyclesCapacity == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if bicycles_capacity is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Check if bicycles_capacity is valid
	if *vehicle.BicyclesCapacity < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", strconv.Itoa(*vehicle.BicyclesCapacity)))
		return
	}
}
