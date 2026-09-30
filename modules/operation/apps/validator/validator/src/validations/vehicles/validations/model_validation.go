package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

- File: [vehicles.txt]
- Field: model
- Presence: Required
- Type: String

# Description

The model of the vehicle.
*/
func ModelValidation(vehicle *types.Vehicle, row int, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("model", "vehicles.txt", "vehicle_model_required", row, services.AppMessageService)
	if rules != nil && rules.Model.Severity != "" {
		ctx.WithSeverity(rules.Model.Severity)
	}

	// 1. Check if model is required
	if vehicle.Model == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("model_validation.required", "model_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Check if model is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("model_validation.forbidden"))
		return
	}
}
