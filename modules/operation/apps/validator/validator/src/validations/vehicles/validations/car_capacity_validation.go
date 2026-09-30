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
  - Field: car_capacity
  - Presence: Optional
  - Type: Non-negative integer

# Description

Number of light vehicles of normal size that the vehicle unit can transport. It is mainly intended for ferries.
When it is equal to 0, it means that the vehicle unit does not allow the boarding of light vehicles.
Required for operators that provide service for light vehicles.

*/

func CarCapacityValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("car_capacity", "vehicles.txt", "vehicles_car_capacity_non_negative", row, services.AppMessageService)
	if rules != nil && rules.CarCapacity.Severity != "" {
		ctx.WithSeverity(rules.CarCapacity.Severity)
	}

	// 1. Check if car_capacity is required
	if vehicle.CarCapacity == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("car_capacity_validation.required", "car_capacity_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if car_capacity is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("car_capacity_validation.forbidden"))
		return
	}

	// 3. Check if car_capacity is valid
	if *vehicle.CarCapacity < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("car_capacity_validation.invalid", strconv.Itoa(*vehicle.CarCapacity)))
		return
	}
}
