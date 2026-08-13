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
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.Make.Severity != "" {
		ctx.WithSeverity(rules.Make.Severity)
	}

	if vehicle.Make == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("make_validation.required"))
		return
	}
}
