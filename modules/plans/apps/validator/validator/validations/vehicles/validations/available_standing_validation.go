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
  - Field: available_standing
  - Presence: Required
  - Type: Number

# Description

The number of standing available on the vehicle.
*/

func AvailableStandingValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("available_standing", "vehicles.txt", "available_standing_non_negative", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.AvailableStanding.Severity != "" {
		ctx.WithSeverity(rules.AvailableStanding.Severity)
	}

	if vehicle.AvailableStanding == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("available_standing_validation.required"))
		return
	}

	if *vehicle.AvailableStanding <= 0 {
		ctx.AddError(ctx.GetTranslatedMessage("available_standing_validation.invalid", strconv.Itoa(*vehicle.AvailableStanding)))
		return
	}
}
