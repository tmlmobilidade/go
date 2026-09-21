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
  - Field: available_seats
  - Presence: Required
  - Type: Number

# Description

The number of seats available on the vehicle.
*/

func AvailableSeatsValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("available_seats", "vehicles.txt", "available_seats_non_negative", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.AvailableSeats.Severity != "" {
		ctx.WithSeverity(rules.AvailableSeats.Severity)
	}

	if vehicle.AvailableSeats == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("available_seats_validation.required"))
		return
	}
	if *vehicle.AvailableSeats <= 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("available_seats_validation.invalid", strconv.Itoa(*vehicle.AvailableSeats)))
		return
	}
}
