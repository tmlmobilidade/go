package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [vehicles.txt]
  - Field: registration_date
  - Presence: Required
  - Type: Date

# Description

Date the vehicle was first registered, in any location.
It is often used to determine the vehicle's age. In the numeric format yyyymmdd.

*/

func RegistrationDateValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("registration_date", "vehicles.txt", "vehicles_registration_date_valid_day_granularity", row, services.AppMessageService)
	if rules != nil && rules.RegistrationDate.Severity != "" {
		ctx.WithSeverity(rules.RegistrationDate.Severity)
	}

	// 1. Check if registration_date is required
	if vehicle.RegistrationDate == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if registration_date is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Check if registration_date is valid
	if !lib.IsValidServiceDate(*vehicle.RegistrationDate) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", *vehicle.RegistrationDate))
		return
	}
}
