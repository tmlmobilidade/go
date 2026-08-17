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
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Model.Severity != "" {
		ctx.WithSeverity(rules.Model.Severity)
	}

	if vehicle.Model == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("model_validation.required"))
		return
	}
}
