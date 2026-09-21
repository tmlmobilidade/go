package vehicles

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [vehicles.txt]
  - Field: vehicle_id
  - Presence: Required
  - Type: unique ID

# Description

Identifies a vehicle.
*/
func VehicleIdValidation(vehicle *types.Vehicle, row int, gtfs *types.Gtfs, rules *types.VehiclesRules) {
	ctx := lib.NewValidationContext("vehicle_id", "vehicles.txt", "vehicle_id_unique", row, services.AppMessageService)
	ctx.Severity = types.SEVERITY_ERROR
	if rules != nil && rules.VehicleId.Severity != "" {
		ctx.WithSeverity(rules.VehicleId.Severity)
	}

	if vehicle.VehicleId == nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("vehicle_id_validation.required"))
		return
	}

	rows, err := gtfs.GetRowsById("vehicles", *vehicle.VehicleId)
	if err == nil && len(rows) > 1 {
		ctx.AddError(ctx.GetTranslatedMessage("vehicle_id_validation.duplicate", *vehicle.VehicleId))
		return
	}
}
