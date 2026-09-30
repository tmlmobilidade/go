package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [vehicles.txt]
- Field: make
- Presence: Required
- Type: String

# Description

The make of the vehicle.
*/
func MakeValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("make", "vehicles.txt", "vehicle_make_required", row, services.AppMessageService)
	if rules != nil && rules.Make.Severity != "" {
		ctx.WithSeverity(rules.Make.Severity)
	}

	// 1. Check if make is required
	if vehicle.Make == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("make_validation.required", "make_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if make is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("make_validation.forbidden"))
		return
	}
}
