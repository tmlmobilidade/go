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

Date of the first registration.
*/

func RegistrationDateValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("registration_date", "vehicles.txt", "registration_date_valid_day_granularity", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.RegistrationDate.Severity != "" {
		ctx.WithSeverity(rules.RegistrationDate.Severity)
	}

	if vehicle.RegistrationDate == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("registration_date_validation.required"))
		return
	}

	if !lib.IsValidServiceDate(*vehicle.RegistrationDate) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("registration_date_validation.invalid", *vehicle.RegistrationDate))
		return
	}
}
